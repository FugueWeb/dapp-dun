//const TokenERC20 = artifacts.require('./TokenERC20.sol');
const DUNToken = artifacts.require('./DUNToken.sol');

module.exports = async (deployer, network) => {

    console.log(`${"-".repeat(30)}
    DEPLOYING DUNToken Contract...\n
    Using ` + network + ` network\n`);

    deployer.deploy(DUNToken, 200, "DiploCoin", "DUN");
};