pragma solidity ^0.6.0;

import "./DUNKollectible.sol";

contract owned {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}

contract tokenRecipient is owned {
    event receivedEther(address sender, uint amount);
    event receivedTokens(address _from, uint256 _value, address _token, bytes _extraData);

    function receiveApproval(address _from, uint256 _value, address payable _token, bytes memory _extraData) public onlyOwner {
        Token t = Token(_token);
        require(t.transferFrom(_from, address(this), _value), "Transfer From Failed");
        emit receivedTokens(_from, _value, _token, _extraData);
    }

    receive() external payable {
        emit receivedEther(msg.sender, msg.value);
    }
}

abstract contract Token {
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;
    function transferFrom(address _from, address _to, uint256 _value) public virtual returns (bool success);
    function burn(uint256 _value) public virtual returns (bool success);
    mapping (address => bool) public frozenAccount;
    receive() external payable { }
}

/**
 * The shareholder governance contract
 */
contract Governance is owned, tokenRecipient, DUNKollectible {

    uint public minimumQuorum;
    uint public debatingPeriodInMinutes;
    Proposal[] public proposals;
    uint public numProposals;
    Token public sharesTokenAddress;
    string constant TOKEN_URI = "https://ropsten.etherscan.io/tx/";

    event ProposalAdded(uint proposalID, address recipient, uint amount, string description);
    event Voted(uint proposalID, bool position, address voter);
    event ProposalTallied(uint proposalID, uint result, uint quorum, bool active, uint256 newItemId);
    event ChangeOfRules(uint newMinimumQuorum, uint newDebatingPeriodInMinutes, address newSharesTokenAddress);

    struct Proposal {
        address recipient;
        address proposer;
        uint amount;
        string description;
        uint minExecutionDate;
        bool executed;
        bool proposalPassed;
        uint numberOfVotes;
        bytes32 proposalHash;
        Vote[] votes;
        mapping (address => bool) voted;
    }

    struct Vote {
        bool inSupport;
        address voter;
    }

    // Modifier that allows only shareholders to vote and create new proposals
    modifier onlyShareholders {
        require(sharesTokenAddress.balanceOf(msg.sender) > 0, "no balance");
        require(!sharesTokenAddress.frozenAccount(msg.sender), "account frozen");
        require(sharesTokenAddress.allowance(msg.sender, address(this)) >= 1, "allowance is not ge 1");
        _;
    }

    /**
     * Constructor
     *
     * First time setup
     */
    constructor(Token sharesAddress, uint minimumSharesToPassAVote, uint minutesForDebate) payable public {
        changeVotingRules(sharesAddress, minimumSharesToPassAVote, minutesForDebate);
    }

    /**
     * Change voting rules
     *
     * Make so that proposals need to be discussed for at least `minutesForDebate/60` hours
     * and all voters combined must own more than `minimumSharesToPassAVote` shares of token `sharesAddress` to be executed
     *
     * @param sharesAddress token address
     * @param minimumSharesToPassAVote proposal can vote only if the sum of shares held by all voters exceed this number
     * @param minutesForDebate the minimum amount of delay between when a proposal is made and when it can be executed
     */
    function changeVotingRules(Token sharesAddress, uint minimumSharesToPassAVote, uint minutesForDebate) public onlyOwner {
        sharesTokenAddress = Token(sharesAddress);
        if (minimumSharesToPassAVote == 0 ) minimumSharesToPassAVote = 1;
        minimumQuorum = minimumSharesToPassAVote;
        debatingPeriodInMinutes = minutesForDebate;
        emit ChangeOfRules(minimumQuorum, debatingPeriodInMinutes, address(sharesTokenAddress));
    }

    /**
     * Add Proposal
     *
     * Propose to send `weiAmount / 1e18` ether to `beneficiary` for `jobDescription`. `transactionBytecode ? Contains : Does not contain` code.
     *
     * @param beneficiary who to send the ether to
     * @param weiAmount amount of ether to send, in wei
     * @param jobDescription Description of job
     * @param transactionBytecode bytecode of transaction
     */
    function newProposal(
        address beneficiary,
        uint weiAmount,
        string memory jobDescription,
        bytes memory transactionBytecode
    )
        public onlyShareholders
        returns (uint proposalID)
    {
        proposalID = proposals.length;
        proposals.push();
        Proposal storage p = proposals[proposalID];
        p.recipient = beneficiary;
        p.proposer = msg.sender;
        p.amount = weiAmount;
        p.description = jobDescription;
        p.proposalHash = keccak256(abi.encodePacked(beneficiary, weiAmount, transactionBytecode));
        p.minExecutionDate = now + debatingPeriodInMinutes * 1 minutes;
        p.executed = false;
        p.proposalPassed = false;
        p.numberOfVotes = 0;
        emit ProposalAdded(proposalID, beneficiary, weiAmount, jobDescription);
        numProposals = proposalID+1;

        return proposalID;
    }

    /**
     * Add proposal in Ether
     *
     * Propose to send `etherAmount` ether to `beneficiary` for `jobDescription`. `transactionBytecode ? Contains : Does not contain` code.
     * This is a convenience function to use if the amount to be given is in round number of ether units.
     *
     * @param beneficiary who to send the ether to
     * @param etherAmount amount of ether to send
     * @param jobDescription Description of job
     * @param transactionBytecode bytecode of transaction
     */
    function newProposalInEther(
        address beneficiary,
        uint etherAmount,
        string memory jobDescription,
        bytes memory transactionBytecode
    )
        public onlyShareholders
        returns (uint proposalID)
    {
        return newProposal(beneficiary, etherAmount * 1 ether, jobDescription, transactionBytecode);
    }

    /**
     * Check if a proposal code matches
     *
     * @param proposalNumber ID number of the proposal to query
     * @param beneficiary who to send the ether to
     * @param weiAmount amount of ether to send
     * @param transactionBytecode bytecode of transaction
     */
    function checkProposalCode(
        uint proposalNumber,
        address beneficiary,
        uint weiAmount,
        bytes memory transactionBytecode
    )
        public view
        returns (bool codeChecksOut)
    {
        Proposal storage p = proposals[proposalNumber];
        return p.proposalHash == keccak256(abi.encodePacked(beneficiary, weiAmount, transactionBytecode));
    }

    /**
     * Log a vote for a proposal
     *
     * Vote `supportsProposal? in support of : against` proposal #`proposalNumber`
     *
     * @param proposalNumber number of proposal
     * @param supportsProposal either in favor or against it
     */
    function vote(
        uint proposalNumber,
        bool supportsProposal
    )
        public onlyShareholders
        returns (uint voteID)
    {
        Proposal storage p = proposals[proposalNumber];
        require(p.voted[msg.sender] != true, "Already voted");

        voteID = p.votes.length;
        p.votes.push();
        // voteID = p.votes.length + 1;
        p.votes[voteID] = Vote({inSupport: supportsProposal, voter: msg.sender});
        p.voted[msg.sender] = true;
        p.numberOfVotes = voteID + 1;
        emit Voted(proposalNumber,  supportsProposal, msg.sender);
        return voteID;
    }

    /**
     * Finish vote
     *
     * Count the votes proposal #`proposalNumber` and execute it if approved
     *
     * @param proposalNumber proposal number
     * @param transactionBytecode optional: if the transaction contained a bytecode, you need to send it
     */
    function executeProposal(uint proposalNumber, bytes memory transactionBytecode) public {
        Proposal storage p = proposals[proposalNumber];

        require(now > p.minExecutionDate && !p.executed &&
            p.proposalHash == keccak256(abi.encodePacked(p.recipient, p.amount, transactionBytecode)),
            "MinExecDate, Executed, or ProposalHash");

        // ...then tally the results
        uint quorum = 0;
        uint yea = 0;
        uint nay = 0;

        for (uint i = 0; i < p.votes.length; ++i) {
            Vote storage v = p.votes[i];
            uint voteWeight = sharesTokenAddress.balanceOf(v.voter);
            quorum += voteWeight;
            if (v.inSupport) {
                yea += voteWeight;
            } else {
                nay += voteWeight;
            }
        }

        require(quorum >= minimumQuorum, "Must achieve minimum quorum");
        uint256 NFT_ID = 0;

        if (yea > nay ) {
            // Proposal passed; execute the transaction

            p.executed = true;
            (bool success, ) = p.recipient.call.value(p.amount)(transactionBytecode);
            require(success, "Call must return true");
            //Reward proposer with NFT
            NFT_ID = awardItem(p.proposer, TOKEN_URI);

            p.proposalPassed = true;
        } else {
            // Proposal failed, mark proposal as having executed
            p.executed = true;
            p.proposalPassed = false;
        }

        // Fire Events
        emit ProposalTallied(proposalNumber, yea - nay, quorum, p.proposalPassed, NFT_ID);
    }

    function dissolve() public onlyOwner {
        selfdestruct(address(sharesTokenAddress));
    }
}
