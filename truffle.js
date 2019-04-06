require('dotenv').config();
var HDWalletProvider = require('truffle-hdwallet-provider');

var mnemonic = process.env.SEED;
var infura = "https://ropsten.infura.io/" + process.env.INFURA_KEY;

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
    //   gas : 6700000,
    //   gasPrice : 10000000000
    }        
  }
}