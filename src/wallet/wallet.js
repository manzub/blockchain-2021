const { generateKeyPairSync } = require('crypto');
const Transaction = require('../transactions/transaction')
const { newWalletAddress } = require('./wallet.utils');

class Wallet {
  constructor() {
    this.accounts = []
    // TODO: load saved acconts
    // TODO: primary wallet
    // TODO: validate address before send
  }

  createAccount() {
    let address = newWalletAddress();
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'pkcs1', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' }
    });
    // TODO: save local
    this.accounts.push({ address, publicKey, privateKey, balance: 0 });
    return {address, balance: 0.00};
  }

  createTransaction({ chain, sender, recipient, amount, gas }) {
    let senderWallet = this.accounts.find(x => x.address == sender);
    if(senderWallet) {
      let currentBalance = this.calculateBalance({ chain, address: sender });
      // proceed
      senderWallet.balance = currentBalance;
      if((amount + gas) > senderWallet.balance) {
        throw new Error('Amount exceeds balance');
      }
      return new Transaction({ senderWallet, recipient, amount, gas })
    }
  }

  calculateBalance({ chain, address }) {
    let hasConductedTransaction = false;
    let outputsTotal = 0;
    for (let index = chain.length - 1; index > 0; index--) {
      const block = chain[index];
      for(let transaction of block.data) {
        if(transaction.input.address === address) {
          hasConductedTransaction = true
        }

        let addressOutput = 0;
        let outputMap = Object.keys(transaction.outputMap);
        if(outputMap.indexOf(address) == 0) {
          if(transaction.status == 'complete') addressOutput = transaction.outputMap[address]
        } else addressOutput = transaction.outputMap[address];

        if(addressOutput) {
          outputsTotal += addressOutput
        }
      }
      if(hasConductedTransaction) break
    }

    return outputsTotal;
  }

  calculateMinerRewards({ chain, address }) {
    let rewardsTotal = 0;
    for (let index = 0; index < chain.length; index++) {
      const block = chain[index];
      for(let transaction of block.data) {
        if(transaction.input.address == '*authorized_address*') {
          if(Object.values(transaction.outputMap).indexOf(address) == 0) {
            rewardsTotal += transaction.outputMap[address]
          }
        }
      }
    }

    return rewardsTotal;
  }

  // TODO: calculate current supply
}

module.exports = Wallet;