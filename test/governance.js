const G = artifacts.require("Governance");
const T = artifacts.require("DUNToken");
const quorum = 1;
const minDebate = 0;
const supply = 200;
const name = "DiploCoin"
const symbol = "DUN"

contract("Governance", async (accounts) => {
  let sharesAddress;
  let _T, _G;

  beforeEach(async () => {
    _T = await T.new(supply, name, symbol);
    _G = await G.new(_T.address, quorum, minDebate);
    await _T.approve(_G.address, 1); //onboard user
    sharesAddress = _T.address;
  });

  it("should create Governance contract correctly", async () => {

    const _tokenAddr = await _G.sharesTokenAddress.call();
    const _quorum = await _G.minimumQuorum.call();
    const _minDebate = await _G.debatingPeriodInMinutes.call();

    assert.equal(_tokenAddr, sharesAddress);
    assert.equal(Number(_quorum), quorum);
    assert.equal(Number(_minDebate), minDebate);
  });

  it("should TRANSFER_OWNERSHIP to Governance contract", async () => {

    const _ownerBefore = await _G.owner.call();
    await _G.transferOwnership(_G.address);
    const _ownerAfter = await _G.owner.call();
    assert.notEqual(_ownerBefore, _ownerAfter);
    assert.equal(_G.address, _ownerAfter);
  });

  it("should allow an approved member to add a PROPOSAL", async () => {

    await _T.transferOwnership(_G.address);
    const _result1 = await _G.newProposal(accounts[1], 0, "test1", "0x", {
      from: accounts[0]
    }).then(result => {
      return result;
    });
    const _result2 = await _G.newProposal(accounts[1], 0, "test2", "0x", {
      from: accounts[0]
    }).then(result => {
      return result;
    });
    assert.equal((_result2.logs[0].args[0]), 1);
  });

  it("should CHECK_PROPOSAL_CODE correctly", async () => {
    let _bytecode = "0x";

    await _T.transferOwnership(_G.address);
    const _result = await _G.newProposal(accounts[1], 0, "test", _bytecode, {
      from: accounts[0]
    }).then(result => {
      return result;
    });
    let _propNumber = _result.logs[0].args[0];
    let _beneficiary = _result.logs[0].args[1];
    let _weiAmount = _result.logs[0].args[2];
    const _bool = await _G.checkProposalCode.call(_propNumber, _beneficiary, _weiAmount, _bytecode);
    assert.isTrue(_bool);
  });

  it("should allow an approved member to VOTE on a proposal", async () => {
    let _bytecode = "0x"

    await _T.transferOwnership(_G.address);
    const _result = await _G.newProposal(accounts[1], 0, "test", _bytecode, {
      from: accounts[0]
    }).then(result => {
      return result;
    });
    let _propNumber = _result.logs[0].args[0];
    const _vote = await _G.vote(_propNumber, true, {
      from: accounts[0]
    }).then(vote => {
      return vote;
    });
    assert.equal(Number(_vote.logs[0].args[0]), Number(_propNumber));
  });

  it("should allow a proposal to EXECUTE and issue an NFT to proposer", async () => {
    let _bytecode = "0x"

    await _T.transferOwnership(_G.address);
    const _result = await _G.newProposal(accounts[1], 0, "test", _bytecode, {
      from: accounts[0]
    }).then(result => {
      return result;
    });
    let _propNumber = _result.logs[0].args[0];
    const _vote = await _G.vote(Number(_propNumber), true, {
      from: accounts[0]
    }).then(vote => {
      return vote;
    });
    await sleep(2000); //wait to ensure proposal can be executed

    let = _execute = await _G.executeProposal(_propNumber, _bytecode, {
      from: accounts[0]
    }).then(execute => {
      return execute;
    });
    assert.isTrue(_execute.logs[1].args[3]); //check that proposal executed
    assert.equal(Number(_execute.logs[0].args[2]), 1); //check that proposer received NFT
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

});
