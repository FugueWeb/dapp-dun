import {Component, OnInit} from '@angular/core';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Web3Service} from '../util/web3.service';
import {TxService} from '../util/transaction.service';
import { MatSnackBar } from '@angular/material';

declare let require: any;
const token_artifacts = require('../../../build/contracts/TokenERC20.json');

@Component({
  selector: 'app-token',
  templateUrl: './tokenERC20.component.html',
  styleUrls: ['./tokenERC20.component.css']
})
export class TokenERC20Component implements OnInit {
  accounts: string[];
  TokenERC20: any;
  sendTokenForm: FormGroup;
  approveForm: FormGroup;

  model = {
    amount: 5,
    receiver: '',
    balance: 0,
    account: '',
    balanceOf: 0
  };

  status = '';

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar, 
    private txService: TxService, private fb: FormBuilder) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    console.log(this);
    this.watchAccount();
    this.web3Service.artifactsToContract(token_artifacts)
      .then((TokenAbstraction) => {
        this.TokenERC20 = TokenAbstraction;
      });
    this.createFormGroups();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      setInterval(() => this.refreshBalance(), 5000);
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  // Form validation
  createFormGroups() {
    this.sendTokenForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
    });
    this.approveForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
    });
  }

  sendTokenErrorMsg(value) {
    return this.sendTokenForm.hasError('required', [value]) ? 'Required' :
      this.sendTokenForm.hasError('minlength', [value]) ? 'Invalid address' :
      this.sendTokenForm.hasError('maxlength', [value]) ? 'Invalid address' : '';
  }

  approveErrorMsg(value) {
    return this.approveForm.hasError('required', [value]) ? 'Required' :
      this.approveForm.hasError('minlength', [value]) ? 'Invalid address' :
      this.approveForm.hasError('maxlength', [value]) ? 'Invalid address' : '';
  }
  async refreshBalance() {
    console.log('Refreshing balance');

    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      console.log(deployedTokenERC20);
      console.log('Account', this.model.account);
      const tokenERC20Balance = await deployedTokenERC20.balanceOf.call(this.model.account);
      console.log('Found balance: ' + tokenERC20Balance);
      this.model.balance = tokenERC20Balance;
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting balance; see log.');
    }
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.model.receiver = e.target.value;
  }

  updateTx(tx) {
    this.txService.updateTx(tx);
  }

  async checkBalanceOf(addr) {
    console.log('Checking token balance of address : ' + addr);

    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      console.log(deployedTokenERC20);
      this.model.balanceOf = await deployedTokenERC20.balanceOf.call(addr, {from: this.model.account});
      console.log('Found balance: ' + this.model.balanceOf);
    } catch (e) {
      console.log(e);
      this.setStatus('Error checking balance; see log.');
    }
  }

  async sendCoin() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const receiver = this.model.receiver;

    console.log('Sending coins' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.transfer.sendTransaction(receiver, amount, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async approve() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const receiver = this.model.receiver;

    console.log('Approve ' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.approve.sendTransaction(receiver, amount, {from: this.model.account});
      console.log(transaction);

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }
}
