### [Click here](https://fuguefoundation.org/association/) for the decentralized application (dApp).

# Setup

Install [Metamask](https://metamask.io/) in Chrome, Firefox, or download the [Brave browser](https://brave.com/) and then enable the extension.

Back up your seed (copy it somewhere safe) and request test ether for the Ropsten network. Good, quick [instructions here](https://blog.bankex.org/how-to-buy-ethereum-using-metamask-ccea0703daec) for how to do this. 

# Join the Association

The token created by contract [TokenERC20.sol](https://ropsten.etherscan.io/address/0x732f6aa748ef46ab034dfba9e9a0a746c682891e) is what affords membership to the Association. Moreover, the amount of tokens you have determines the weight of your vote toward a given proposal. There are two options for you to get these stakeholder tokens.

1. For those who want an interactive experience, to propose new governance models, get help with troubleshooting, and assist with posing/answering questions to help build this project, login to Github (go here to [create an account](https://github.com/join)) and post your Metamask account address [in this Issue](https://github.com/fuguefoundation/dapp-association/issues/1) within this repository. I will send you an amount of tokens based on the governance model specified below.

2. Using Metamask, send a small amount of Ropsten test ether to `0x5632aB6622614bc3eB4AeA5e04f431784d9E4D60` and I will send you an amount of tokens based on the governance model specified below. This method preserves your privacy. You are also free to then login to Github and join the conversation.

To know whether you have received your tokens, open Metamask, click the menu bar (top left), then click 'Add Token' at the bottom. Choose 'Custom Token' and paste in the Token address shown on the dApp webpage. The symbol is XFF and the decimal is 1. When you open the menu again, you should see your current balance. The dApp also displays your token balance.

# Governance Model and Token Distribution

Some of the key details that determine the governance model are:
* the total of minutes required for debate of a proposal
* the quorum, or the amount of votes required for a proposal to pass (or fail)
* the token address and its distribution that enables stakeholders to have agency within the association

For the first iteration, the amount of tokens distributed to a given address will be determined through random number generation (between 1 and 10 tokens). This is meant to mimic a distribution of wealth/influence/power/etc within a population set. After approximately one week (around December 17, 2018), the quorum will be raised to 50% of the total tokens distributed, and the debate time period for a proposal will increase to two days.

For the first few days after launch, however, the minutes for debate will be set at 0 with a quorum of 1. Thus proposals can be made and voted on with no wait time or objection to give users a chance to become familiar with the dApp. Please post ideas for new governance models as an issue in this repo.

# Using the dApp

**Make sure you are logged in to Metamask, using the Ropsten network and that you have test ether.**

`Approve` the Association contract to receive your tokens. Enter an amount that does not exceed the number of tokens you have and copy/paste the address of the Association contract. Click send token. Once the transaction completes, scroll to the bottom of the page. Since you've made a transaction that has changed the state of the smart contract (for which you paid a small fee to do), there is a transaction hash you can track on the blockchain. Click the link to open a block explorer and see all related information for that transaction. Each time you change state, a new link will be available at the bottom of the page.

The `Send` token function can be ignored unless one of the following situations applies: 1. Initial distribution of tokens by contract owner to stakeholders or 2. Stakeholder wants to delegate authority from their supply to another address (thus increasing other address' potential voting weight).

Now the Association contract needs to `Receive Approval` to maintain an account balance of your stake (and thus establish the weight of your vote). Enter your address in `from` (you can copy it from inside Metamask). The `amount` is likely the same amount you put when you called the `Approve` function, but it doesn't have to be. Copy/paste the Token address in, and put 0 for `data` (this is an advanced feature to discuss later). Notice, scroll to the top of the page and see that your balance has decreased by the amount you sent. Likewise, if you paste the Association address where it says `Check token balance of address`, that balance will have increased by the same amount.

When you initially received tokens, you were authorized to make proposals. However, now that the Association contract has received your approval to send those tokens, you are now able to vote on those proposals. You can skip ahead to vote on existing proposals if you want.

To make a `New Proposal` enter in an amount of ether in the denomination wei (the smallest denomination of ether). Use the helper conversion function for this. So for example, .1 ETH converts to 100000000000000000 wei. The `beneficiary` address is who (or what) will receive the ether, so you can pick any valid Ethereum address. You could, for example, open Metamask, click the avatar image in the top right, and choose create account to get a new address that you control. Include a `description` in text and put 0 for `data`.

* Bear in mind that proposals can do far more than just award an address some ether. The `data` parameter is what allows us to do this, but we will leave it alone for now.

Let's see the proposal you just made. Find on the page where it says `Number of Proposals`, subtract 1 from that number (e.g., 5 = 4), and enter that number into `Get Proposal Details`. Your proposal details and relevant voting information should appear. Note, we subtracted one here because arrays are zero indexed.

Before voting on anything, it makes sense to confirm irrefutably that we know what it is we are voting on. So let's use the proposal just created since we know all the details, or click on the `Issues` tab in this repo to see what others have posted. Enter those details into `Check Proposal Code`. If you entered everything correctly, you should see `true`. Change any value, no matter how small, it will either evaluate to false or throw a compilation error (open the console for more info).

So let's `vote` on a proposal. Simple enough, put in the proposal number as before and choose true or false (yea or nay). However many tokens you sent to the Association contract will determine your voting weight and get us that much closer to the minimum `quorum` required. Note, if you try `Get Proposal Details` again, you will see the number of votes has increased.

Before we `Execute Proposal`, consider that if any of the following circumstances are true, the transaction will fail (and Metamask will likely show a warning too before you confirm the transaction):
* The minimum quorum has not been met
* The time for debate has not yet been reached. The number you see for this in the proposal info is a UNIX time stamp. You can [go here](https://www.unixtimestamp.com/) to convert this number into something human readable.
* The previous two conditions have been met and the proposal has already been executed, resulting in the proposal already passing or failing.
* The Association address is who actually pays out the ether to the beneficiary. Thus if the contract itself does not have enough ether in it to cover what was passed in the proposal, the transaction will fail. Send an appropriate amount of ether to the Association contract using Metamask. Click the fox icon, then send, and paste in the Association address for the recipient and the amount in ether. You shouldn't need to worry about the gas fee on a testnet.
* Note, anybody (not just stakeholders) can actually execute a proposal if all these conditions have been met. All they need to do is call the `Execute Proposal` function.

Now let's really execute it. Put in the proposal number and 0 for data. Try `Get Proposal Details` again and note the changes. You can also check the beneficiary address using a block explorer to see how their ether balance has increased.

`Change Voting Rules` is special, since only the contract owner of Association can call it. So, for all intents and purposes, there is a benevolent dictatorship at play for purposes of this testing environment, meaning whoever controls that address can unilaterally change key aspects of the governance model. **HOWEVER** there are absolutely ways to remove this power once the model is established and before any voting/proposal making begins, which can be explored/discussed later.

# Advanced Topics

Coming soon. Topics will include:

* What the `data` parameter can do
* Reading contract events
* Distributing power away from the contract owner
* New functionality

# Feedback and Trouble shooting 

This is an open source project. Please post any comments - technical, political, or otherwise - by creating or responding to an issue. That way we can properly track and discuss it. Likewise, if you make new proposals or vote on existing ones, feel free to put comments there too to alert others (though this information is available publicly on the blockchain).

* Open the developer's console in your browser to see more information. This provides helpful information about errors to assist troubleshooting.

* For each state changing transaction, a pop up window should appear from Metamask. If not, or if you close it (without rejecting the tx), check to see if a little number has appeared on the fox icon in your browser. Click the fox and the transaction should still be waiting for you.

# Resources

* Truffle and [Angular Box](https://truffleframework.com/boxes/angular-truffle-box)
* Angular 6
* Solidity
* Metamask

# References

* https://ethereum.org/token
* https://ethereum.org/dao 