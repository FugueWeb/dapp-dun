const T = artifacts.require("DUNToken");
const G = artifacts.require("Governance");
const name = "DiploCoin";
const symbol = "DUN";
const supply = 200;

contract("DUNToken", async (accounts) => {
  let sharesAddress;

  beforeEach(async () => {
    _T = await T.new(supply, name, symbol);
    sharesAddress = _T.address;
  });

  it("should create DUNToken contract correctly and assign totalSupply to msg.sender balance", async () => {

    const _name = await _T.name.call();
    const _symbol = await _T.symbol.call();
    const _totalSupply = await _T.totalSupply.call();
    const _balance = await _T.balanceOf.call(accounts[0]);

    assert.equal(_name, name);
    assert.equal(_symbol, symbol);
    assert.equal(Number(_balance).toString(), Number(_totalSupply).toString());
  });

  it("should APPROVE 1 DUN token to Governance contract", async () => {

    const _G = await G.new(_T.address, 1, 0);
    await _T.approve(_G.address, 1);
    const _allowance = await _T.allowance.call(accounts[0], _G.address).then(result => {
      return result;
    });

    assert.equal(_allowance, 1);
  });

  it("should TRANSFER 1 DUN token to another address", async () => {

    const _balanceBefore = await _T.balanceOf.call(accounts[1]);
    await _T.transfer(accounts[1], 1, {
      from: accounts[0]
    });
    const _balanceAfter = await _T.balanceOf.call(accounts[1]);

    assert.isAbove(Number(_balanceAfter), Number(_balanceBefore));
  });

  it("should TRANSFER_OWNERSHIP to Governance contract", async () => {

    const _G = await G.new(_T.address, 1, 0);
    const _ownerBefore = await _T.owner.call();
    await _T.transferOwnership(_G.address);
    const _ownerAfter = await _T.owner.call();

    assert.notEqual(_ownerBefore, _ownerAfter);
    assert.equal(_G.address, _ownerAfter);
  });

  it("should work END_TO_END", async () => {
    _bytecode = "0xe15c1fc7"; //bytecode to Open Market

    const _G = await G.new(_T.address, 1, 0);
    await _T.approve(_G.address, 1); //onboard user
    await _T.transferOwnership(_G.address); //Transfer Token contract to Gov contract
    await _G.transferOwnership(_G.address); //Transfer Gov contract ownership to itself

    const _result = await _G.newProposal(_T.address, 0, "Open Market", _bytecode, {
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
    await sleep(2000); //wait to ensure proposal can be executed

    const _execute = await _G.executeProposal(_propNumber, _bytecode, {
      from: accounts[0]
    }).then(execute => {
      return execute;
    });
    assert.isTrue(_execute.logs[1].args[3]); //check that proposal executed
  });
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

});
