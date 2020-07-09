require('dotenv').config();
var HDWalletProvider = require("@truffle/hdwallet-provider");

var mnemonic = process.env.SEED;
var infura = "https://ropsten.infura.io/v3/" + process.env.INFURA_PROJECT_ID;

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
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, infura)
      },
      network_id: 3,
      gas : 7221975, //default: 6721975
      gasPrice : 150000000000 //default: 100000000000
    }        
  },
  compilers: {
      solc: {
          version: "^0.6.6"
      }
  }
}