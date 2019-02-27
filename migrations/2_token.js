// Contracts
//const null1 = artifacts.require('./null1.sol');
const TokenERC20 = artifacts.require('./TokenERC20.sol');

module.exports = async (deployer, network) => {

    console.log(`${"-".repeat(30)}
    DEPLOYING TokenERC20 Contract...\n
    Using ` + network + ` network\n`);

    deployer.deploy(TokenERC20, 100, "Fugue", "XFF");
};