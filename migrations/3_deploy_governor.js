const DiploCoin = artifacts.require('DiploCoin');
const StateGovernor = artifacts.require('StateGovernor');
const TimelockController = artifacts.require('TimelockController');

module.exports = async function (deployer) {
  await deployer.deploy(DiploCoin,{overwrite: false});
  const tokenInstance = await DiploCoin.deployed();
  await deployer.deploy(TimelockController, 20, [],[]);
  const timelockInstance = await TimelockController.deployed();
  await deployer.deploy(StateGovernor, tokenInstance.address, timelockInstance.address);
};
