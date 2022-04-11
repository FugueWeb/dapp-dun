import {Component, OnInit} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import {Validators, FormGroup, FormBuilder} from '@angular/forms';
import {Web3Service} from '../util/web3.service';
import {TxService} from '../util/transaction.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../util/dialog.component';
import { Gov } from '../models/gov';
import { Proposal } from '../models/proposal';
import { Contract } from '../models/contract';

declare let require: any;
const governance_artifacts = require('../../../build/contracts/Governance.json');
const token_artifacts = require('../../../build/contracts/DUNToken.json');
const dialog_data = require('./info.json');
const participants = require('../models/participants.json')

@Component({
  selector: 'app-governance',
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.css']
})
export class GovernanceComponent implements OnInit {
  accounts: string[];
  proposals: number[];
  Governance: any;
  TokenERC20: any;
  status = '';
  selectedParticipant: string;
  receiveApprovalForm: FormGroup;
  newProposalForm: FormGroup;
  voteForm: FormGroup;
  checkProposalForm: FormGroup;
  checkRepForm: FormGroup;
  executeProposalForm: FormGroup;
  changeVotingForm: FormGroup;
  transferOwnershipForm: FormGroup;

  model: Gov = new Gov();
  proposal: Proposal = new Proposal();
  govContract: Contract = new Contract();

  constructor(private web3Service: Web3Service, private matSnackBar: MatSnackBar,
    private txService: TxService, private fb: FormBuilder, private dialog: MatDialog,
    private clipboard: Clipboard) {
    console.log('Constructor: ' + web3Service);
  }

  ngOnInit(): void {
    this.watchAccount();
    // this.web3Service.artifactsToContract(governance_artifacts)
    //   .then((GovernanceAbstraction) => {
    //     this.Governance = GovernanceAbstraction;
    //     this.getGovernanceData();
    //   });
    this.createFormGroups();
    // this.web3Service.artifactsToContract(token_artifacts)
    //   .then((TokenAbstraction) => {
    //     this.TokenERC20 = TokenAbstraction;
    //   });
    this.model.participants = participants
  }

  watchAccount() {
    this.web3Service.accountsObservable.subscribe((accounts) => {
        this.accounts = accounts;
        this.model.account = accounts[0];    
      // this.refreshBalance();
    });
    this.web3Service.providerObservable.subscribe(() => {
        this.web3Service.artifactsToContract(governance_artifacts)
            .then((GovernanceAbstraction) => {
            this.Governance = GovernanceAbstraction;
            this.getGovernanceData();
        });
        this.web3Service.artifactsToContract(token_artifacts)
            .then((TokenAbstraction) => {
            this.TokenERC20 = TokenAbstraction;
        });        
    });
  }

  async getGovernanceData() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    try {
        console.log(this.Governance)
      const deployedGovernance = await this.Governance.deployed();
      const deployedTokenERC20 = await this.TokenERC20.deployed();
      console.log(deployedGovernance);

      this.govContract.address = deployedGovernance.address;
      this.govContract.quorum = await deployedGovernance.minimumQuorum.call();
      this.govContract.minMinutes = await deployedGovernance.debatingPeriodInMinutes.call();
      this.govContract.sharesAddress = await deployedGovernance.sharesTokenAddress.call();
      this.govContract.numProposals = await deployedGovernance.numProposals.call();
      this.web3Service.getETHBalance(deployedGovernance.address).then(res => {
        this.model.contractBalance = this.web3Service.convertWeitoETH(res);
      });

    } catch (e) {
      console.log(e);
      this.setStatus('Error getting Governance data; see log.');
    }
  }

  /************* FORM VALIDATION & ERROR HANDLING *************/

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
    this.checkRepForm = this.fb.group({
      addr: ['', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]],
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

  checkRepErrorMsg(value) {
    return this.checkRepForm.hasError('required', [value]) ? 'Required' : '';
  }

  voteErrorMsg(value) {
    return this.voteForm.hasError('required', [value]) ? 'Required' : '';
  }

  executeProposalErrorMsg(value) {
    return this.executeProposalForm.hasError('required', [value]) ? 'Required' : '';
  }

  /************* SET STATE *************/

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

  /************* CONTRACT FUNCTIONS *************/

  async newProposal() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const beneficiary = this.model.beneficiary;
    const justification = this.model.justification;
    const data = this.model.data;

    console.log('Proposal to send ' + amount + ' wei to ' + beneficiary + ' because ' + justification + '. Data: ' + data);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.newProposal.sendTransaction(beneficiary, amount, justification, data, {
        from: this.model.account
      });

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
        await this.getGovernanceData();
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error making proposal; see log.');
    }
  }

  async getProposal(pNumber) {
    console.log('Checking proposal number: ' + pNumber);

    try {
      const deployedGovernance = await this.Governance.deployed();
      const result = await deployedGovernance.proposals.call(pNumber, {
        from: this.model.account
      });
      console.log(result);
      this.proposal.amount = result.amount;
      this.proposal.desc = result.description;
      this.proposal.beneficiary = result.recipient;
      this.proposal.executed = result.executed;
      this.proposal.minExecutionDate = result.minExecutionDate;
      this.proposal.numberOfVotes = result.numberOfVotes;
      this.proposal.proposalHash = result.proposalHash;
      this.proposal.proposalPassed = result.proposalPassed;
      //this.proposal = String(result).split(',');
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting proposal; see log.');
    }
  }

  async checkProposalCode() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const amount = this.model.amount;
    const beneficiary = this.model.beneficiary;
    const proposalNum = this.model.proposalNum;
    const data = this.model.data;

    console.log('Check proposal ' + proposalNum + ' to send ' + amount + ' to ' + beneficiary + '. Data: ' + data);

    this.setStatus('Checking Proposal... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.checkProposalCode.call(proposalNum, beneficiary, amount, data, {
        from: this.model.account
      });

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
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const choice = this.model.vote;
    const proposalNum = this.model.proposalNum;

    console.log('Vote ' + choice + ' for proposal ' + proposalNum);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.vote.sendTransaction(proposalNum, choice, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error voting for proposal; see log.');
    }
  }

  async executeProposal() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const data = this.model.data;
    const proposalNum = this.model.proposalNum;

    console.log('Execute proposal ' + proposalNum + ' with data ' + data);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.executeProposal.sendTransaction(proposalNum, data, {
        from: this.model.account
      });

      this.txSuccess(transaction);
      await this.getGovernanceData();
      this.web3Service.updateContract(); //alert Token contract to refresh state
    } catch (e) {
      console.log(e);
      this.setStatus('Error executing proposal; see log.');
    }
  }

  async receiveApproval() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const data = this.model.data;
    const amount = this.model.amount;

    console.log('Receive approval from ' + this.model.account + ' for ' + this.govContract.sharesAddress + ' to receive ' + amount + ' with data ' + data);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.receiveApproval.sendTransaction(this.model.account, amount, this.govContract.sharesAddress, data, {
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error receiving approval; see log.');
    }
  }

  async transferOwnership() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const newOwner = this.model.newOwner;

    console.log('Transfer ownership of Governance to ' + newOwner);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.transferOwnership.sendTransaction(newOwner, {
        from: this.model.account
      });


      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error transferring ownership; see log.');
    }
  }

  async changeVotingRules() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    const tokenAddr = this.model.tokenAddr;
    const quorum = this.model.quorum;
    const minMinutes = this.model.minMinutes;

    console.log('Change token contract to ' + tokenAddr + ' with ' + minMinutes + ' for debate and quorum of ' + quorum);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.changeVotingRules.sendTransaction(tokenAddr, quorum, minMinutes, {
        from: this.model.account
      });

      if (!transaction) {
        this.model.checkProp = transaction;
        this.setStatus('Transaction failed!');
      } else {
        this.model.checkProp = transaction;
        this.setStatus('Transaction complete!');
        this.updateTx(transaction);
        await this.getGovernanceData();
      }
    } catch (e) {
      console.log(e);
      this.model.checkProp = 'error, see log';
      this.setStatus('Error changing voting rules; see log.');
    }
  }

  async dissolve() {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    console.log('Self destruct contract');

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.dissolve.sendTransaction({
        from: this.model.account
      });

      this.txSuccess(transaction);
    } catch (e) {
      console.log(e);
      this.setStatus('Error with self destruct; see log.');
    }
  }

  async checkReputation(repAddress) {
    if (!this.Governance) {
      this.setStatus('Governance is not loaded, unable to send transaction');
      return;
    }

    console.log('Checking Reputation');

    this.setStatus('Checking Reputation... (please wait)');
    try {
      const deployedGovernance = await this.Governance.deployed();
      const transaction = await deployedGovernance.balanceOf.call(repAddress, {
        from: this.model.account
      });

      const deployedTokenERC20 = await this.TokenERC20.deployed();
      this.model.DUNbalance = this.web3Service.convertWeitoETH(await deployedTokenERC20.balanceOf.call(repAddress, {
        from: this.model.account
      }));
      this.web3Service.getETHBalance(repAddress).then(res => {
        this.model.participantETHBalance = this.web3Service.convertWeitoETH(res);
      });
      
      if (!transaction) {
        this.model.checkProp = transaction;
        this.setStatus('Check Reputation failed!');
      } else {
        this.model.checkProp = transaction;
        this.model.reputation = transaction.words[0];
        this.setStatus('Check Reputation complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error with Reputation Details; see log.');
    }
  }

  /************* HELPER FUNCTIONS *************/

  txSuccess(success) {
    if (!success) {
      this.setStatus('Transaction failed!');
    } else {
      this.setStatus('Transaction complete!');
      this.updateTx(success);
    }
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

  updateTx(tx) {
    this.txService.updateTx(tx);
  }

  setStatus(status: string) {
    this.matSnackBar.open(status, null, {
      duration: 3000
    });
  }

  getWeiFromETH(amount) {
    this.model.convert_wei = this.web3Service.convertETHToWei(amount);
  }

  copyText(textToCopy: string) {
    this.clipboard.copy(textToCopy);
    this.setStatus('Copied to clipboard')
  }
}
