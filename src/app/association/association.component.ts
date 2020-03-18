import {Component, OnInit} from '@angular/core';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Web3Service} from '../util/web3.service';
import {TxService} from '../util/transaction.service';
import { MatSnackBar } from '@angular/material';
import {MatDialog} from '@angular/material';
import { DialogComponent } from '../util/dialog.component';

declare let require: any;
const association_artifacts = require('../../../build/contracts/Association.json');
const dialog_data = require('./info.json');

@Component({
  selector: 'app-association',
  templateUrl: './association.component.html',
  styleUrls: ['./association.component.css']
})
export class AssociationComponent implements OnInit {
  accounts: string[];
  proposals: number[];
  Association: any;
  receiveApprovalForm: FormGroup;
  newProposalForm: FormGroup;
  voteForm: FormGroup;
  checkProposalForm: FormGroup;
  executeProposalForm: FormGroup;
  changeVotingForm: FormGroup;
  transferOwnershipForm: FormGroup;

  contract = {
    address: '',
    quorum: 0,
    minMinutes: 0,
    sharesAddress: '',
    numProposals: 0
  };

  model = {
    beneficiary: '',
    amount: 0,
    justification: '',
    data: '',
    account: '',
    balance: 0,
    proposal: {
        amount: 0,
        desc: '',
        executed: false,
        minExecutionDate: 0,
        numberOfVotes: 0,
        proposalHash: 0,
        proposalPassed: false,
        beneficiary: ''
    },
    proposalNum: 0,
    vote: '',
    checkProp: '',
    tokenAddr: '',
    quorum: '',
    minMinutes: '',
    newOwner: ''
  };

  convert = {
    wei: 0,
    ether: 0
  };

  status = '';

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar,
    private txService: TxService, private fb: FormBuilder, private dialog: MatDialog) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    console.log('OnInit: ' + this.web3Service);
    this.watchAccount();
    this.web3Service.artifactsToContract(association_artifacts)
      .then((AssociationAbstraction) => {
        this.Association = AssociationAbstraction;
        this.getAssociationData();
      });
    this.createFormGroups();
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
      this.accounts = accounts;
      this.model.account = accounts[0];
      // this.refreshBalance();
    });
  }

  // Form validation
  createFormGroups() {
    this.receiveApprovalForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
      token: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      data: ['', Validators.required]
    });
    this.newProposalForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
      desc: ['', [Validators.required, Validators.maxLength(42)]],
      data: ['', Validators.required]
    });
    this.checkProposalForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      amount: ['', Validators.required],
      number: ['', Validators.required],
      data: ['', Validators.required]
    });
    this.voteForm = this.fb.group({
      number: ['', Validators.required],
      bool: ['', Validators.required]
    });
    this.executeProposalForm = this.fb.group({
      number: ['', Validators.required],
      data: ['', Validators.required]
    });
    this.changeVotingForm = this.fb.group({
      token: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
      minMinutes: ['', Validators.required],
      quorum: ['', Validators.required]
    });
    this.transferOwnershipForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
    });
  }

  openDialog(index): void {
      let choice;
      for (let i = 0; i < dialog_data.length; i++) {
        if(dialog_data[i].id === index) {
            choice = dialog_data[i];
        }
      }
      
    this.dialog.open(DialogComponent, {
      width: '400px',
      data: {id: choice.id, desc: choice.desc}
    });
  }

  receiveApprovalErrorMsg(value) {
    return this.receiveApprovalForm.hasError('required', [value]) ? 'Required' :
      this.receiveApprovalForm.hasError('minlength', [value]) ? 'Invalid address' :
      this.receiveApprovalForm.hasError('maxlength', [value]) ? 'Invalid address' : '';
  }

  newProposalErrorMsg(value) {
    return this.newProposalForm.hasError('required', [value]) ? 'Required' :
      this.newProposalForm.hasError('minlength', [value]) ? 'Invalid address' :
      this.newProposalForm.hasError('maxlength', [value]) ? 'Invalid address' : '';
  }

  checkProposalErrorMsg(value) {
    return this.checkProposalForm.hasError('required', [value]) ? 'Required' :
    this.checkProposalForm.hasError('minlength', [value]) ? 'Invalid address' :
    this.checkProposalForm.hasError('maxlength', [value]) ? 'Invalid address' : '';
  }

  voteErrorMsg(value) {
    return this.voteForm.hasError('required', [value]) ? 'Required' : '';
  }

  executeProposalErrorMsg(value) {
    return this.executeProposalForm.hasError('required', [value]) ? 'Required' : '';
  }

  getWeiFromETH(amount) {
    this.convert.wei = this.web3Service.convertETHToWei(amount);
  }

  async getAssociationData() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    try {
      const deployedAssociation = await this.Association.deployed();
      console.log(deployedAssociation);

      this.contract.address = deployedAssociation.address;
      this.contract.quorum = await deployedAssociation.minimumQuorum.call();
      this.contract.minMinutes = await deployedAssociation.debatingPeriodInMinutes.call();
      this.contract.sharesAddress = await deployedAssociation.sharesTokenAddress.call();
      this.contract.numProposals = await deployedAssociation.numProposals.call();

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting Association data; see log.');
    }
  }

  updateTx(tx) {
    this.txService.updateTx(tx);
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, {duration: 3000});
  }

  setAmount(e) {
    console.log('Setting amount: ' + e.target.value);
    this.model.amount = e.target.value;
  }

  setBeneficiary(e) {
    console.log('Setting beneficiary: ' + e.target.value);
    this.model.beneficiary = e.target.value;
  }

  setJustification(e) {
    console.log('Setting justification: ' + e.target.value);
    this.model.justification = e.target.value;
  }

  setProposalNumber(e) {
    console.log('Setting proposal number: ' + e.target.value);
    this.model.proposalNum = e.target.value;
  }

  setData(e) {
    console.log('Setting data: ' + e.target.value);
    this.model.data = e.target.value;
  }

  setTokenAddr(e) {
    console.log('Setting token address: ' + e.target.value);
    this.model.tokenAddr = e.target.value;
  }

  setQuorum(e) {
    console.log('Setting quorum: ' + e.target.value);
    this.model.quorum = e.target.value;
  }

  setDebatePeriod(e) {
    console.log('Setting debate period: ' + e.target.value);
    this.model.minMinutes = e.target.value;
  }

  setTransferOwnership(e) {
    console.log('Transfer Owner: ' + e.target.value);
    this.model.newOwner = e.target.value;
  }
  
  async newProposal() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const beneficiary = this.model.beneficiary;
    const justification = this.model.justification;
    const data = this.model.data;

    console.log('Proposal to send ' + amount + ' wei to ' + beneficiary + ' because ' + justification + '. Data: ' + data);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.newProposal.sendTransaction(beneficiary, amount, justification, data, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
        this.getAssociationData();
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error making proposal; see log.');
    }
  }

  async getProposal(pNumber) {
    console.log('Checking proposal number: ' + pNumber);

    try {
      const deployedAssociation = await this.Association.deployed();
      const result = await deployedAssociation.proposals.call(pNumber, {from: this.model.account});;
      console.log(result);
      this.model.proposal.amount = result.amount;
      this.model.proposal.desc = result.description;
      this.model.proposal.beneficiary = result.recipient;
      this.model.proposal.executed = result.executed;
      this.model.proposal.minExecutionDate = result.minExecutionDate;
      this.model.proposal.numberOfVotes = result.numberOfVotes;
      this.model.proposal.proposalHash = result.proposalHash;
      this.model.proposal.proposalPassed = result.proposalPassed;
      //this.model.proposal = String(result).split(',');
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting proposal; see log.');
    }
  }

  async checkProposalCode() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const beneficiary = this.model.beneficiary;
    const proposalNum = this.model.proposalNum;
    const data = this.model.data;

    console.log('Check proposal ' + proposalNum + ' to send ' + amount + ' to ' + beneficiary + '. Data: ' + data);

    this.setStatus('Checking Proposal... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.checkProposalCode.call(proposalNum, beneficiary, amount, data, {from: this.model.account});

      if (!transaction) {
        this.model.checkProp = transaction;
        this.setStatus('Check Proposal failed!');
      } else {
        this.model.checkProp = transaction;
        this.setStatus('Check Proposal complete!');
      }
    } catch (e) {
      console.log(e);
      this.model.checkProp = 'error, see log';
      this.setStatus('Error checking proposal code; see log.');
    }
  }

  async vote() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const choice = this.model.vote;
    const proposalNum = this.model.proposalNum;

    console.log('Vote ' + choice + ' for proposal ' + proposalNum);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.vote.sendTransaction(proposalNum, choice, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error voting for proposal; see log.');
    }
  }

  async executeProposal() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const data = this.model.data;
    const proposalNum = this.model.proposalNum;

    console.log('Execute proposal ' + proposalNum + ' with data ' + data);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.executeProposal.sendTransaction(proposalNum, data, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error executing proposal; see log.');
    }
  }

  async receiveApproval() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const data = this.model.data;
    const amount = this.model.amount;

    console.log('Receive approval from ' + this.model.account + ' for ' + this.contract.sharesAddress + ' to receive ' + amount + ' with data ' + data);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.receiveApproval.sendTransaction(this.model.account, amount, this.contract.sharesAddress, data, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error receiving approval; see log.');
    }
  }

  async transferOwnership() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const newOwner = this.model.newOwner;

    console.log('Transfer ownership of Association to ' + newOwner);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.transferOwnership.sendTransaction(newOwner, {from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error transferring ownership; see log.');
    }
  }

  async changeVotingRules() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    const tokenAddr = this.model.tokenAddr;
    const quorum = this.model.quorum;
    const minMinutes = this.model.minMinutes;

    console.log('Change token contract to ' + tokenAddr + ' with ' + minMinutes + ' for debate and quorum of ' + quorum);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.changeVotingRules.sendTransaction(tokenAddr, quorum, minMinutes, {from: this.model.account});

      if (!transaction) {
        this.model.checkProp = transaction;
        this.setStatus('Transaction failed!');
      } else {
        this.model.checkProp = transaction;
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
        this.getAssociationData();
      }
    } catch (e) {
      console.log(e);
      this.model.checkProp = 'error, see log';
      this.setStatus('Error changing voting rules; see log.');
    }
  }

  async dissolve() {
    if (!this.Association) {
      this.setStatus('Association is not loaded, unable to send transaction');
      return;
    }

    console.log('Self destruct contract');

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedAssociation = await this.Association.deployed();
      const transaction = await deployedAssociation.dissolve.sendTransaction({from: this.model.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error with self destruct; see log.');
    }
  }
}
