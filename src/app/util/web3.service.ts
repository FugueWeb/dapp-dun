import {Injectable} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Subject, Subscription} from 'rxjs';

import Onboard, { OnboardAPI, WalletState } from '@web3-onboard/core'
import injectedModule, { ProviderLabel } from '@web3-onboard/injected-wallets'
import Notify from "bnc-notify"
import { environment } from 'src/environments/environment';
import Web3 from 'web3';

//declare let window: any;
//declare let require: any;

const ROPSTEN_RPC_URL = 'https://ropsten.infura.io/v3/' + environment.INFURA_ID;
const CHAIN_ID = '0x539' //Ropsten 0x3 - Ganache 0x539
const contract = require('@truffle/contract');
const onboard = Onboard({
    wallets: [injectedModule({
        filter: {
          [ProviderLabel.Detected]: false
        }
      })],
    chains: [
      {
        id: CHAIN_ID,
        token: 'tROP',
        label: 'Ethereum Ropsten Testnet',
        rpcUrl: ROPSTEN_RPC_URL
      }
    ],
    appMetadata: {
      name: 'd-UN',
      icon: 'assets/fugue.png',
      logo: 'assets/fugue.png',
      description: 'Decentralized governance and economic model',
      gettingStartedGuide: 'todo',
      explore: 'https://github.com/fugueweb/dapp-dun',
      recommendedInjectedWallets: [ 
        { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
        { name: 'MetaMask', url: 'https://metamask.io' },
        { name: 'Opera', url: 'https://opera.com' },
        { name: 'Status', url: 'https://status.im' },
        { name: 'Brave', url: 'https://brave.com' }
      ]
    },
    accountCenter: {
        desktop: {
            position: 'topRight'
        }
    }
  })

@Injectable()
export class Web3Service {
  private web3: Web3;
  private web3Provider: any;
  private onboardUnsubscribe: Subscription;
  private accounts: string[];
  public ready = false;
  public accountsObservable = new Subject < string[] > ();
  public providerObservable = new Subject < any > ();
  public updateContractObservable = new Subject < any > ();
  //private onboarding: any;

  constructor(private matSnackBar: MatSnackBar) {
    window.addEventListener('load', (event) => {
      //this.bootstrapWeb3();
      this.blockNativeOnboard();
      this.web3 = new Web3();
      //this.onboarding = new MetaMaskOnboarding();
    });
  }

  ngOnDestroy(): void {
    this.onboardUnsubscribe.unsubscribe();
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    // if (typeof window.web3 !== 'undefined') {
    //   // Use Mist/MetaMask's provider
    //   this.web3 = new Web3(window.web3.currentProvider);
    //   console.log(this.web3);
    // } else {
    //   console.log('No web3? You should consider trying MetaMask!');

    //   // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
    //   Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
    //   // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //   // 8545 for Testnet, 7545 for Ganache
    //   //this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    //   this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
    // }
    //this.checkNetwork();
    //setInterval(() => this.refreshAccounts(), 10000);
  }

  public async artifactsToContract(artifacts) {
    // if (!this.web3) {
    //   const delay = new Promise(resolve => setTimeout(resolve, 100));
    //   await delay;
    //   return await this.artifactsToContract(artifacts);
    // }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3Provider);
    return contractAbstraction;
  }

  private refreshAccounts() {
    const data: WalletState[] = this.getWalletState()

    this.accountsObservable.next([data[0].accounts[0].address]);
    this.accounts = [data[0].accounts[0].address];
    this.ready = true;
    // this.web3.eth.getAccounts((err, accs) => {
    //   console.log('Refreshing accounts');
    //   if (err != null) {
    //     console.warn('There was an error fetching your accounts.');
    //     return;
    //   }

    //   // Get the initial account balance so it can be displayed.
    //   if (accs.length === 0) {
    //     console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
    //     return;
    //   }

    //   if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
    //     console.log('Observed new accounts');

    //     this.accountsObservable.next(accs);
    //     this.accounts = accs;
    //   }

    //});
  }

  public async blockNativeOnboard() {
    const previouslyConnectedWallets = JSON.parse(
        window.localStorage.getItem('connectedWallets')
      )
      
      if (previouslyConnectedWallets) {
        // Connect the most recently connected wallet (first in the array)
        await onboard.connectWallet({ autoSelect: previouslyConnectedWallets[0] });
      }      
      
      const wallets = await onboard.connectWallet();
      //Require Ropsten chain
      const success = await onboard.setChain({ chainId: CHAIN_ID });
      this.setBNLocalStorage(wallets);
      this.refreshAccounts();
      this.web3Provider = this.getWalletState()[0].provider
      this.providerObservable.next(this.getWalletState()[0].provider);
      console.log(this.getWalletState());
      console.log(wallets)      
  }

  private setBNLocalStorage(wallets){
      const walletsSub = onboard.state.select('wallets')
      this.onboardUnsubscribe = walletsSub.subscribe(wallets => {
        const connectedWallets = wallets.map(({ label }) => label)
        window.localStorage.setItem(
          'connectedWallets',
          JSON.stringify(connectedWallets)
        )
      })
  }

  public getWalletState() {
      return onboard.state.get().wallets;
  }

  private setStatus(status) {
    this.matSnackBar.open(status, null, {
      duration: 4000
    });
  }

  public updateContract(){
    this.updateContractObservable.next('foo');
  }

  public convertETHToWei(amount) {
      let value = this.web3.utils.toWei(this.web3.utils.toBN(amount), 'ether');
      return value.toNumber();
    //return this.web3.utils.toWei(this.web3.utils.toBN(amount), 'ether');
  }

  public convertWeitoETH(amount) {
      let value = this.web3.utils.fromWei(this.web3.utils.toBN(amount), 'ether');
      return Number(value);
    //return this.web3.utils.fromWei(this.web3.utils.toBN(amount), 'ether');
  }

  public getETHBalance(addr) {
    let web3Balance = new Web3(this.web3Provider);
    return web3Balance.eth.getBalance(addr);
  }
}
