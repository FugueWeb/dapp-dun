![GitHub](https://img.shields.io/github/license/FugueWeb/dapp-dun)

### [Click here](https://fugueweb.com/dev/dun) for the decentralized application (dApp).

# Setup

Install [Metamask](https://metamask.io/) in Chrome, Firefox, or [Brave browser](https://brave.com/) and then enable the extension. You must use a computer or laptop (no mobile configuration yet).

Backup your 12-word seed (copy it somewhere safe) and request test ether for the Ropsten network. Good, quick [instructions here](https://blog.bankex.org/how-to-buy-ethereum-using-metamask-ccea0703daec) for how to do this.

On the dapp page, click the icon (top right) to connect your Metamask wallet.

## Join the Decentralized UN

This dApp consists of two smart contracts: one for Governance and one for Token economics. The token created by contract [DUNToken.sol](https://ropsten.etherscan.io/address/0x034b62Abcd077de0FF079EEbb4598FF6dB0cE6Ea) is what affords membership to the Decentralized United Nations (d-UN). Moreover, the amount of tokens you have determines the weight of your vote toward a given proposal. There are two options for you to get these stakeholder tokens.

1. For those who want an interactive experience, to propose new governance models, get help with troubleshooting, and contribute to the knowledgement management of this project, login to Github (go here to [create an account](https://github.com/join)) and post your Metamask account address [in this Issue](https://github.com/fuguefoundation/dapp-dun/issues/1) within this repository.

2. Using Metamask, send a small amount of Ropsten test ether (e.g., 0.1 ETH) to the [Governance Contract](https://ropsten.etherscan.io/address/0x65757C9A900f19A7d8949Ce323Aa18c29C26204b) and I will send you some DUN tokens. This method preserves your privacy. You are always free to then login to Github and join the conversation.

To know whether you have received your tokens, open Metamask, click the menu bar (top left), then click 'Add Token' at the bottom. Choose 'Custom Token' and paste in the Token address shown on the dApp webpage. The symbol is DUN and the decimal is 18. When you open the menu again, you should see your current balance. The dApp also displays your token balance.

## Governance Model and Token Capabilities

Some of the key details that determine the governance model are:
* the total minutes required for debate of a proposal
* the quorum, or the amount of votes required for a proposal to pass (or fail)
* the token address and its distribution that enables stakeholders to have agency within the Decentralized UN

## Using the dApp

**Checklist - Ensure that you are:** 
* on the [dApp webpage](https://fugueweb.com/dev/dun)
* logged in to Metamask and connected with the site
* using the Ropsten network
* have test ether
* have a token balance greater than 0

1. `Approve` the Governance contract to receive your tokens. Enter an amount that does not exceed the number of tokens you have and copy/paste the address of the Governance contract. Click send token. Once the transaction completes, scroll to the bottom of the page. Since you've made a transaction that has changed the state of the smart contract (for which you paid a small fee to do), there is a transaction hash you can track on the blockchain. Click the link to open a block explorer and see all related information for that transaction. Each time you change state, a new link will be available at the bottom of the page.

* This step is necessary as a check on the system. Think of this as a type of escrow or membership due. You are not giving the token to the d-UN, but you are essentially relinquishing sovereignty to it by giving permission for the d-UN to "do something" (i.e., burn, sanction) with the token you approved. Note, you are not incentived to approve more than one token, but you are free to do so.

* OPTIONAL: The `Send` token function can likely be ignored. It is used for initial distribution of tokens by the token contract owner to stakeholders. Stakeholder can use this function to send tokens to other stakeholders, thereby delegating authority and thus increasing the other address' potential voting weight (at the sender's expense). Note, this needs to be done prior to executing the next step.

2. To make a `New Proposal` enter in an amount of ether in the denomination `wei` (the smallest denomination of ether). Use the helper conversion function for this. So for example, 0.1 ether converts to 100000000000000000 wei. Don't make the amount too big, since you are likely going to be the one to provide these funds to the contract. The `beneficiary` address is who (or what) will ultimately receive the ether, so you can pick any valid Ethereum address. You could, for example, open Metamask, click the avatar image in the top right, and create an account to get a new address that you control. Include a brief text `description` and put 0x for `data`.

* Proposals can do *far* more than just award an address some ether. The `data` parameter is what allows us to do this, but we will leave it alone for now.

3. Let's see the proposal you just made. Find on the page where it says `Number of Proposals`, subtract 1 from that number (e.g., 5 = 4), and enter that number into `Get Proposal Details`. Your proposal details and relevant voting information should appear. Note, we subtracted one here because arrays are zero indexed.

4. Before voting on anything, it makes sense to confirm cryptographically that we know what it is we are voting on. So let's use the proposal just created since we know all the details, or get the information for another proposal by entering any number (as before) less than the total number of proposals. Enter corresponding details into `Check Proposal Code`, assume that data is 0x. If you entered everything correctly, you should see `true`. What happened is the values you entered are compared against the `proposalHash` stored on chain. Change any value, no matter how small, it will either evaluate to false or throw a compilation error (if curious or troubleshooting, open the browser console to see more info).

5. So let's `vote` on a proposal. Simple enough, put in the proposal number as before and choose true or false (yea or nay). However many tokens you sent to the Governance contract will determine your voting weight and get us that much closer to the minimum `quorum` required. Note, if you try `Get Proposal Details` again, you will see the number of votes has increased. If you get an error, ensure that:
* You haven't already voted
* You've completed step 1 above
* The proposal has not already been executed

6. We're almost ready to `Execute Proposal`. Interestingly, anybody (not just stakeholders) can actually execute a proposal if all the proposal conditions have been met. All they need to do is call this public function. Final check, otherwise the transaction will fail:
* The minimum quorum has been met
* The time for debate has been reached. The number you see for this in the proposal info is a UNIX time stamp. You can [go here](https://www.unixtimestamp.com/) to convert this number into something human readable.
* The proposal has not already been executed, resulting in the proposal already passing or failing.
* The Governance address has enough ether in it. Bear in mind, *it is the smart contract* that actually pays out the ether to the beneficiary. Thus if the contract itself does not have enough ether in it to cover what was passed in the proposal, the transaction will fail. You can check the ether balance of the Governance contract by clicking its address link. To send the appropriate amount of ether to the contract using Metamask,click the fox icon, 'send', and paste in the Governance address as the recipient and the amount in ether. You shouldn't need to worry about the gas fee on a testnet.

8. Now let's really execute it. Put in the proposal number and 0x for data. Try `Get Proposal Details` again and note the changes. You can also check the beneficiary address using a block explorer to see how their ether balance has increased.

`Change Voting Rules` is special, since only the contract owner of the Governance contract can call it. So, for all intents and purposes, there is a benevolent dictatorship at play for purposes of this testing environment, meaning whoever controls that address can unilaterally change key aspects of the governance model. **HOWEVER** there are transparent ways to remove or redistribute this power once the model is established and before any voting/proposal making begins, which can be explored/discussed later.

## Testing

* Install Truffle: `npm install truffle -g`
* Run a local blockchain, I suggest [Ganache](https://www.trufflesuite.com/docs/ganache/overview)
* `truffle test --network ganache`

## Trouble Shooting 

[Change Log](https://github.com/FugueWeb/dapp-dun/blob/master/.github/CHANGELOG.md) and [Contributing](https://github.com/FugueWeb/dapp-dun/blob/master/.github/CONTRIBUTING.md) guidelines

This is an open source project. Please post any comments - technical, political, or otherwise - by creating or responding to an issue. That way we can properly track and discuss it. Likewise, if you make new proposals or vote on existing ones, feel free to put comments there too to alert others (though this information is available publicly on the blockchain).

* Open the developer's console in your browser to see more information. This provides helpful information about errors to assist troubleshooting.

* For each state changing transaction, a pop up window should appear from Metamask. If not, or if you close it (without rejecting the tx), check to see if a little number has appeared on the fox icon in your browser. Click the fox and the transaction should still be waiting for you.

* If the dApp is not reading your address, go into Metamask's settings and under Security & Privacy, turn off Privacy Mode. Now refresh the page. 

## Dev

First clone the repo and `npm install`. Putting aside the Angular piece, you will need to compile and deploy the smart contracts. Truffle is an excellent option for local testing, for example:

* Run Ganache (port 7545)
    * Take the mnemonic seed provided, put that into Metamask (or any Web3 provider), and you should see a 100ETH test balance
* `truffle migrate`
    * This should compile and then deploy the smart contracts
* `ng serve`
    * Now use the Angular CLI to start the app frontend

## Resources

* Truffle and [Angular Box](https://truffleframework.com/boxes/angular-truffle-box)
* Angular 8
* Solidity
* Metamask
* Ethereum
