import {Component, OnInit} from '@angular/core';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Web3Service} from '../util/web3.service';
import {TxService} from '../util/transaction.service';
import { MatSnackBar } from '@angular/material';
import {MatDialog} from '@angular/material';
import { DialogComponent } from '../util/dialog.component';
import { Token } from '../models/token';

declare let require: any;
declare let window: any;
const token_artifacts = require('../../../build/contracts/DUNToken.json');
const dialog_data = require('../governance/info.json');

@Component({
  selector: 'app-token',
  templateUrl: './tokenERC20.component.html',
  styleUrls: ['./tokenERC20.component.css']
})
export class TokenERC20Component implements OnInit {
  accounts: string[];
  TokenERC20: any;
  status: string = '';
  sendTokenForm: FormGroup;
  approveForm: FormGroup;
  transferOwnershipForm: FormGroup;
  mintForm: FormGroup;
  setPricesForm: FormGroup;
  burnFromForm: FormGroup;
  sellTokenForm: FormGroup;
  buyTokenForm: FormGroup;
  sanctionForm: FormGroup;
  checkSanctionForm: FormGroup;
  allowanceForm: FormGroup;

  model: Token = new Token();

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar,
    private txService: TxService, private fb: FormBuilder, private dialog: MatDialog) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    this.watchContract();
    this.web3Service.artifactsToContract(token_artifacts)
      .then((TokenAbstraction) => {
        this.TokenERC20 = TokenAbstraction;
      });
    this.createFormGroups();
  }

  watchContract() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      //setInterval(() => this.refreshBalance(), 10000);
      this.refreshBalance();
    });
    this.web3Service.updateContractObservable.subscribe(() =>{
        this.refreshBalance();
    })
  }

  async refreshBalance() {
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      this.model.balance = this.web3Service.convertWeitoETH(await deployedTokenERC20.balanceOf.call(this.model.account));
      this.model.dunTokensBalance = this.web3Service.convertWeitoETH(await deployedTokenERC20.balanceOf.call(deployedTokenERC20.address));
      this.model.totalSupply = this.web3Service.convertWeitoETH(await deployedTokenERC20.totalSupply.call());
      this.model.sellPrice = this.web3Service.convertWeitoETH(await deployedTokenERC20.sellPrice.call());
      this.model.buyPrice = this.web3Service.convertWeitoETH(await deployedTokenERC20.buyPrice.call());
      this.model.buySellState = await deployedTokenERC20.buySellAllowed.call({
        from: this.model.account
      });
      this.web3Service.getETHBalance(deployedTokenERC20.address).then(res => {
        this.model.contractBalance = this.web3Service.convertWeitoETH(res);
      });

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting balance; see log.');
    }
  }

  /************* FORM VALIDATION & ERROR HANDLING *************/

  createFormGroups() {
    this.sendTokenForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
    });
    this.approveForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
    });
    this.transferOwnershipForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]]
    });
    this.mintForm = this.fb.group({
      amount: ['', Validators.required],
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]]
    });
    this.setPricesForm = this.fb.group({
      amount: ['', Validators.required]
    });
    this.burnFromForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
    });
    this.sellTokenForm = this.fb.group({
      amount: ['', Validators.required]
    });
    this.buyTokenForm = this.fb.group({
      amount: ['', Validators.required]
    });
    this.sanctionForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      bool: ['', Validators.required]
    });
    this.allowanceForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]]
    });
    this.checkSanctionForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]]
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

  /************* SET STATE *************/

  setSendAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.sendAmount = e.target.value;
  }

  setSendReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.model.sendReceiver = e.target.value;
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.amount = e.target.value;
  }

  setReceiver(e) {
    console.log('Setting receiver: ' + e.target.value);
    this.model.receiver = e.target.value;
  }

  setTransferOwnership(e) {
    console.log('Setting new owner: ' + e.target.value);
    this.model.newOwner = e.target.value;
  }

  setMintAmount(e) {
    console.log('Setting mint amount: ' + e.target.value);
    this.model.mintAmount = e.target.value;
  }

  setMintReceiver(e) {
    console.log('Setting mint receiver: ' + e.target.value);
    this.model.mintReceiver = e.target.value;
  }

  setSellPriceAmount(e) {
    console.log('Setting mint receiver: ' + e.target.value);
    this.model.setSellPrice = e.target.value;
  }

  setBuyPriceAmount(e) {
    console.log('Setting mint receiver: ' + e.target.value);
    this.model.setBuyPrice = e.target.value;
  }

  setBurnFromAddress(e) {
    console.log('Setting mint receiver: ' + e.target.value);
    this.model.burnFromAddr = e.target.value;
  }

  setBurnFromAmount(e) {
    console.log('Setting mint receiver: ' + e.target.value);
    this.model.burnFromAmount = e.target.value;
  }

  setSanctionAddr(e) {
    console.log('Sanction member: ' + e.target.value);
    this.model.sanctionAddr = e.target.value;
  }

  /************* CONTRACT FUNCTIONS *************/

  async checkBalanceOf(addr) {
    console.log('Checking token balance of address : ' + addr);

    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      this.model.balanceOf = this.web3Service.convertWeitoETH(await deployedTokenERC20.balanceOf.call(addr, {
        from: this.model.account
      }));
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

    const amount = this.model.sendAmount;
    const receiver = this.model.sendReceiver;

    console.log('Sending coins' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.transfer.sendTransaction(receiver, amount, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
    this.refreshBalance();
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
      const transaction = await deployedTokenERC20.approve.sendTransaction(receiver, amount, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error approving; see log.');
    }
  }

  async transferOwnership() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const newOwner = this.model.newOwner;

    console.log('Transfer ownership of TokenERC20 to ' + newOwner);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.transferOwnership.sendTransaction(newOwner, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error transferring ownership; see log.');
    }
  }

  async mint() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.mintAmount;
    const receiver = this.model.mintReceiver;

    console.log('Mint ' + amount + ' to ' + receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.mintToken.sendTransaction(receiver, amount, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error minting; see log.');
    }
    this.refreshBalance();
  }

  async setPrices() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const sellAmount = this.model.setSellPrice;
    const buyAmount = this.model.setBuyPrice;

    console.log('Sell Price: ' + sellAmount + ', Buy Price: ' + buyAmount);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.setPrices.sendTransaction(sellAmount, buyAmount, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error setting prices; see log.');
    }
    this.refreshBalance();
  }

  async allowBuySell() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    console.log('Open/close the market');

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.allowBuySell.sendTransaction({
        from: this.model.account
      });
      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error allowing/denying buy/sell; see log.');
    }
    this.refreshBalance();
  }

  async sellToken(amount) {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    console.log('Sell: ' + amount);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.sell.sendTransaction(amount, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error selling; see log.');
    }
    this.refreshBalance();
  }

  async buyToken(value) {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    console.log('Buy amount (in wei): ' + value);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.buy.sendTransaction({
        from: this.model.account,
        value: value
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error buying; see log.');
    }
    this.refreshBalance();
  }

  async checkAllowance(addr1, addr2) {
    console.log('Checking whether : ' + addr1 + ' allows ' + addr2);

    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      this.model.allowanceAmount = await deployedTokenERC20.allowance.call(addr1, addr2, {
        from: this.model.account
      });
      console.log('Allowed amount: ' + this.model.allowanceAmount);
    } catch (e) {
      console.log(e);
      this.setStatus('Error checking allowance; see log.');
    }
  }

  async checkSanction(addr) {
    console.log('Checking whether sanctioned: ' + addr);

    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      this.model.isSanctioned = await deployedTokenERC20.frozenAccount.call(addr, {
        from: this.model.account
      });
      console.log('Address sanctioned: ' + this.model.isSanctioned);
    } catch (e) {
      console.log(e);
      this.setStatus('Error checking sanction; see log.');
    }
  }

  async sanction() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const member = this.model.sanctionAddr;
    const freeze = this.model.sanctionState;

    console.log('Sanction member ' + member + ' : ' + freeze);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      const transaction = await deployedTokenERC20.freezeAccount.sendTransaction(member, freeze, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error sanctioning member; see log.');
    }
  }

  async burnFrom() {
    if (!this.TokenERC20) {
      this.setStatus('TokenERC20 is not loaded, unable to send transaction');
      return;
    }

    const value = this.model.burnFromAmount;
    const from = this.model.burnFromAddr;

    console.log('Burn ' + value + ' from account ' + from);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      console.log(deployedTokenERC20);
      const transaction = await deployedTokenERC20.burnFrom.sendTransaction(from, value, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error burning from; see log.');
    }
    this.refreshBalance();
  }

  /************* HELPER FUNCTIONS *************/

  updateTx(tx) {
    this.txService.updateTx(tx);
  }

  txSuccess(success: boolean) {
    if (!success) {
      this.setStatus('Transaction failed!');
    } else {
      this.setStatus('Transaction complete!');
      this.updateTx(success);
    }
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {
      duration: 3000
    });
  }

  openDialog(index): void {
    let choice;
    for (let i = 0; i < dialog_data.length; i++) {
      if (dialog_data[i].id === index) {
        choice = dialog_data[i];
      }
    }
    this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        id: choice.id,
        desc: choice.desc
      }
    });
  }
}
