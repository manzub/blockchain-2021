const { v4 } = require("uuid");
const walletUtils = require("../wallet/wallet.utils");

class Transaction {
  constructor({ senderWallet, recipient, amount, status, gas, input, outputMap }) {
    this.id = v4()
    this.status = status || 'pending'
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount, gas })
    this.input = input || this.createInput({ senderWallet, outputMap: this.outputMap })
  }

  createOutputMap({ senderWallet, recipient, amount, gas }) {
    const outputMap = {}
    // TODO: add script account
    outputMap[recipient] = amount
    outputMap[senderWallet.address] = senderWallet.balance - (amount + gas);
    return outputMap;
  }

  createInput({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.address,
      signature: walletUtils.signTransaction({ senderWallet, data: outputMap })
    }
  }

  static validTransaction(transaction) {
    const { input, outputMap } = transaction;
    const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total+outputAmount);
    if(outputTotal > input.amount) {
      console.error('Invalid Transaction');
      return false
    }
    if(!walletUtils.verifySignature({ address: input.address, data: outputMap, signature: input.signature })) {
      console.log('Invalid transaction signature');
      return false
    }

    return true;
  }

  // TODO: move new supply function & reward function
  static rewardTransaction({ minerWallet, reward }) {
    return new this({ 
      status: 'complete',
      input: { address: '*authorized_address*' },
      outputMap: { [minerWallet]: reward }
    })
  }
}

module.exports = Transaction;