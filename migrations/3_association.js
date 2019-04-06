//const TokenERC20 = artifacts.require('./TokenERC20.sol');
const AdvancedToken = artifacts.require('./AdvancedToken.sol');
const Association = artifacts.require('./Association.sol');

module.exports = async (deployer, network) => {

    console.log(`${"-".repeat(30)}
    DEPLOYING ASSOCIATION CONTRACTS...\n
    Using ` + network + ` network\n`);

    deployer.deploy(Association, AdvancedToken.address, 2, 0);

};