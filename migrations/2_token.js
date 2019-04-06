//const TokenERC20 = artifacts.require('./TokenERC20.sol');
const AdvancedToken = artifacts.require('./AdvancedToken.sol');

module.exports = async (deployer, network) => {

    console.log(`${"-".repeat(30)}
    DEPLOYING AdvancedToken Contract...\n
    Using ` + network + ` network\n`);

    deployer.deploy(AdvancedToken, 200, "DiploCoin", "DUN");
};