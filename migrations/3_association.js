// Contracts
const TokenERC20 = artifacts.require('./TokenERC20.sol');
const null2 = artifacts.require('./null2.sol');
const Association = artifacts.require('./Association.sol');

module.exports = async (deployer, network) => {

    console.log(`${"-".repeat(30)}
    DEPLOYING ASSOCIATION CONTRACTS...\n
    Using ` + network + ` network\n`);

    deployer.deploy([null2, [Association, TokenERC20.address, 51, 0]]);

};