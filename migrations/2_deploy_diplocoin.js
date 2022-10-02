const DiploCoin = artifacts.require('DiploCoin');

module.exports = async function (deployer) {
  await deployer.deploy(DiploCoin);
};
