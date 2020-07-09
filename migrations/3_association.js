//const TokenERC20 = artifacts.require('./TokenERC20.sol');
const DUNToken = artifacts.require('./DUNToken.sol');
const Governance = artifacts.require('./Governance.sol');

module.exports = async (deployer, network) => {

    console.log(`${"-".repeat(30)}
    DEPLOYING Governance CONTRACTS...\n
    Using ` + network + ` network\n`);

    deployer.deploy(Governance, DUNToken.address, 2, 0);

};