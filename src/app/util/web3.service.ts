import {Injectable} from '@angular/core';
import * as contract from 'truffle-contract';
import {Subject} from 'rxjs';
declare let require: any;
const Web3 = require('web3');


declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  public ready = false;
  public MetaCoin: any;
  public accountsObservable = new Subject<string[]>();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
      console.log(this.web3);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      // 8545 for Metamask, 7545 for Ganache
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
      // this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    }
    this.checkNetwork();
    setInterval(() => this.refreshAccounts(), 5000);
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  async checkNetwork() {
    const netID = await this.web3.eth.net.getNetworkType((err, network) => {
    });
    switch (netID) {
      case '1':
        console.log('You are using MainNet. Please connect to Ropsten.');
        break;
      case '2':
        console.log('You are using Morden. Please connect to Ropsten.');
        break;
      case '3':
        console.log('You are using Ropsten, excellent!');
        break;
      case '4':
        console.log('You are using Rinkeby. Please connect to Ropsten.');
        break;
      case 'private':
        console.log('Using private test net');
        break;
      default:
        console.log('Unknown network. Please connect to Ropsten in Metamask.');
        break;
    }
  }

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }

  public convertETHToWei(amount) {
    return this.web3.utils.toWei(amount, 'ether');
  }
}
