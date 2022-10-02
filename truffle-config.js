require('dotenv').config();
var HDWalletProvider = require("@truffle/hdwallet-provider");

var mnemonic = process.env.SEED;
const infuraOGoerliKey = process.env.INFURA_OGOERLI_KEY;

module.exports = {
  networks: {
    ganache: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    }, 
    metamask: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*' // Match any network id
    },
    ogoerli: {
        network_id: 420,
        chain_id: 420,
        provider: function () {
          return new HDWalletProvider(mnemonic, "https://optimism-goerli.infura.io/v3/" + infuraOGoerliKey, 0, 1);
        },
        networkCheckTimeout: 999999
    },
    oganache: {
      provider: () => {
        return new HDWalletProvider('enter Ganache seed here', 'http://localhost:8545')
      },
      network_id: "420"
    }
  },
  compilers: {
    solc: {
      version: "0.8.14",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 800
       }
       //evmVersion: "byzantium"
      }
    }
  }
}