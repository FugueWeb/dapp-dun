import {Injectable} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {Subject, Subscription} from 'rxjs';

import Onboard, { EIP1193Provider, OnboardAPI, WalletState } from '@web3-onboard/core'
import injectedModule, { ProviderIdentityFlag, ProviderLabel } from '@web3-onboard/injected-wallets'
import Notify, { Emitter, InitOptions, Notification, NotificationObject, NotificationType, NotifyMessages, UpdateNotification } from "bnc-notify"
import Web3 from 'web3';
import { environment } from 'src/environments/environment';
import { TxService } from 'src/app/util/transaction.service';
const contract = require('@truffle/contract');

//declare let window: any;
//declare let require: any;

/******* BLOCKNATIVE CONFIG ***********/

// Change these parameters depending on network being used
const ROPSTEN_RPC_URL = 'https://ropsten.infura.io/v3/' + environment.INFURA_ID;
//Ropsten 0x3 - Ganache 0x539
// const CHAIN_ID = '0x539'
// const networkID: number = 35;
const CHAIN_ID = '0x3'
const networkID: number = 3; 

const networkIdToUrl = {
    '1': 'https://etherscan.io/tx',
    '3': 'https://ropsten.etherscan.io/tx',
    '5': 'https://goerli.etherscan.io/tx',
    '35': 'localhost'
}
const notifyOptions: InitOptions = {
    dappId: environment.BLOCK_NATIVE_KEY,
    system: 'ethereum',
    networkId: networkID,
    darkMode: true
}
const notify = Notify(notifyOptions);
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

/******* MAIN ***********/

@Injectable()
export class Web3Service {
  private web3: Web3;
  private web3Provider: any;
  private onboardUnsubscribe: Subscription;
  private address: string;
  public walletStateObservable$ = new Subject < WalletState[] > ();
  public providerObservable$ = new Subject < EIP1193Provider > ();

  constructor(private matSnackBar: MatSnackBar, private txService: TxService) {
    window.addEventListener('load', (event) => {
      this.blockNativeOnboard();
      this.web3 = new Web3();
      setInterval(()=> { this.refresh() }, 60 * 1000);
    });
  }

  ngOnDestroy(): void {
    this.onboardUnsubscribe.unsubscribe();
  }

  public async artifactsToContract(artifacts) {
    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3Provider);
    return contractAbstraction;
  }

  private refresh() {
    console.log('Refreshing state');
    const data: WalletState[] = this.getWalletState();
    this.walletStateObservable$.next([data[0]]);
    this.providerObservable$.next(this.getWalletState()[0].provider);
    this.address = data[0].accounts[0].address;
  }

  /******* BLOCKNATIVE FUNCTIONS ***********/

  public async blockNativeOnboard() {
    const previouslyConnectedWallets = JSON.parse(
        window.localStorage.getItem('connectedWallets')
      )
      
      if (previouslyConnectedWallets) {
        // Connect the most recently connected wallet (first in the array)
        await onboard.connectWallet({ autoSelect: previouslyConnectedWallets[0] });
      }      
      
      const wallets = await onboard.connectWallet();
      //Require specific chain
      const success = await onboard.setChain({ chainId: CHAIN_ID });
      this.setBNLocalStorage(wallets);
      this.web3Provider = this.getWalletState()[0].provider
      this.providerObservable$.next(this.getWalletState()[0].provider);
      this.refresh();
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

  private notifyBlockNative(self: this, hash) {
    const {emitter} = notify.hash(hash);
    this.txService.txObservable.next(hash);
    emitter.on('all', function(tx) {
        setTimeout(() => {
            self.walletStateObservable$.next(self.getWalletState())},8000
        );
        setTimeout(() => {
            self.providerObservable$.next(self.getWalletState()[0].provider)},8000
        );
        return {
            onclick: () => window.open(`${networkIdToUrl[notifyOptions.networkId]}/${tx.hash}`)
        }
    });
  }

  public getWalletState() {
      return onboard.state.get().wallets;
  }

  /******* TOKEN FUNCTIONS ***********/

  public approve(instance, _receiver, _amount) {
      let self = this;
      instance.approve.sendTransaction( _receiver, _amount, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public transfer(instance, _receiver, _amount) {
      let self = this;
      instance.transfer.sendTransaction( _receiver, _amount, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public mintToken(instance, _receiver, _amount) {
      let self = this;
      instance.mintToken.sendTransaction( _receiver, _amount, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public setPrices(instance, _sellAmount, _buyAmount) {
      let self = this;
      instance.setPrices.sendTransaction( _sellAmount, _buyAmount, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public allowBuySell(instance) {
      let self = this;
      instance.allowBuySell.sendTransaction({from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public sell(instance, _amount) {
      let self = this;
      instance.sell.sendTransaction(_amount, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public buy(instance, _value) {
      let self = this;
      instance.buy.sendTransaction({from:self.address, value: _value}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public burnFrom(instance, _from, _value) {
      let self = this;
      instance.burnFrom.sendTransaction(_from, _value, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public freezeAccount(instance, _member, _freeze) {
      let self = this;
      instance.freezeAccount.sendTransaction(_member, _freeze, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public transferOwnership(instance, _newOwner) {
      let self = this;
      instance.transferOwnership.sendTransaction( _newOwner, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }
  /******* GOVERNANCE FUNCTIONS ***********/

  public newProposal(instance, _beneficiary, _amount, _justification, _data) {
      let self = this;
      instance.newProposal.sendTransaction(_beneficiary, _amount, _justification, _data, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public vote(instance, _proposalNum, _choice) {
      let self = this;
      instance.vote.sendTransaction(_proposalNum, _choice, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public executeProposal(instance, _proposalNum, _data) {
      let self = this;
      instance.executeProposal.sendTransaction(_proposalNum, _data, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public changeVotingRules(instance, _tokenAddr, _quorum, _minMinutes) {
      let self = this;
      instance.changeVotingRules.sendTransaction(_tokenAddr, _quorum, _minMinutes, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }
  
  public receiveApproval(instance, _account, _amount, _address, _data) {
      let self = this;
      instance.receiveApproval.sendTransaction(_account, _amount, _address, _data, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public transferGovOwnership(instance, _newOwner) {
      let self = this;
      instance.transferOwnership.sendTransaction(_newOwner, {from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  public dissolve(instance) {
      let self = this;
      instance.dissolve.sendTransaction({from:self.address}).on('transactionHash', function(hash){
        self.notifyBlockNative(self, hash);
      })
  }

  /******* HELPER FUNCTIONS ***********/
  private setStatus(status) {
    this.matSnackBar.open(status, null, {
      duration: 4000
    });
  }

  public convertETHToWei(amount) {
      let value = this.web3.utils.toWei(amount, 'ether');
      return value;
    //return this.web3.utils.toWei(this.web3.utils.toBN(amount), 'ether');
  }

  public convertWeitoETH(amount) {
      let value = this.web3.utils.fromWei(this.web3.utils.toBN(amount), 'ether');
      return value;
    //return this.web3.utils.fromWei(this.web3.utils.toBN(amount), 'ether');
  }

  public getETHBalance(addr) {
    let web3Balance = new Web3(this.web3Provider);
    return web3Balance.eth.getBalance(addr);
  }
}
