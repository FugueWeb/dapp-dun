import {Injectable} from '@angular/core';
import { MatSnackBar } from '@angular/material';
//import * as contract from 'truffle-contract';
const contract = require('@truffle/contract');
import {Subject} from 'rxjs';
declare let window: any;
declare let require: any;
const Web3 = require('web3');

@Injectable()
export class Web3Service {
  public web3: any;
  private accounts: string[];
  public ready = false;
  public MetaCoin: any;
  public accountsObservable = new Subject<string[]>();

  constructor(private matSnackBar: MatSnackBar) {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 4000});
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
      //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    }
    this.checkNetwork();
    setInterval(() => this.refreshAccounts(), 10000);
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
    let netID;
    await this.web3.eth.net.getNetworkType((err, network) => {
        netID = network;
    });
    switch (netID) {
      case 'main':
        this.setStatus('You are using MainNet. Please connect to Ropsten.');
        break;
      case 'goerli':
        this.setStatus('You are using Goerli. Please connect to Ropsten.');
        break;
      case 'ropsten':
        this.setStatus('You are using Ropsten, excellent!');
        break;
      case 'rinkeby':
        this.setStatus('You are using Rinkeby. Please connect to Ropsten.');
        break;
      case 'private':
        this.setStatus('Using private test net');
        break;
      default:
        this.setStatus('Unknown network. Please connect to Ropsten in Metamask.');
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
    return this.web3.utils.toWei(amount.toString(), 'ether');
  }

  public convertWeitoETH(amount) {
    return this.web3.utils.fromWei(amount.toString(), 'ether');
  }

  public getETHBalance(addr) {
    return this.web3.eth.getBalance(addr);
  }
}
