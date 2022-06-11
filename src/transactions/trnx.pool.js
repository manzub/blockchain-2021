const Transaction = require("./transaction")
const transactionUtils = require("./transaction.utils")

class TransactionPool {
  constructor() {
    // TODO: test load saved trnx-pool
    this.pool = {...transactionUtils.loadSavedTrnxPool()}
  }

  addToPool(transaction) {
    this.pool[transaction.id] = transaction
    // TODO: test save local
    transactionUtils.saveTransactionToLocal(transaction)
  }

  completeTransaction(transaction) {
    this.removeTransaction(transaction)
    transaction.status = 'complete'
    this.addToPool(transaction)
    //TODO: test update local transaction
    transactionUtils.updateLocalTrnx(transaction, 'repl')
  }

  updateTransaction(senderWallet, transaction, recipient, amount, gas) {
    let sender = transaction.input.address;
    if((amount+gas) > transaction.outputMap[sender]) {
      throw new Error('Amount exceeds balance')
    }

    if(!transaction.outputMap[recipient]) {
      transaction.outputMap[recipient] = amount
    } else transaction.outputMap[recipient] += amount

    // TODO: add script account
    transaction.outputMap[sender] -= (amount + gas)
    this.removeTransaction(transaction);
    let newTrnx = new Transaction({ senderWallet, outputMap: transaction.outputMap, gas, amount })
    newTrnx.id = transaction.id;
    return newTrnx;
  }

  removeTransaction(transaction) {
    // TODO: test remove local
    transactionUtils.updateLocalTrnx(transaction, 'delete')
    let newMap = Object.values(this.pool).filter(x => x.id != transaction.id)
    this.setPool({})
    newMap.forEach(trnx => this.addToPool(trnx))
  }

  setPool(trnxPool) {
    this.pool = trnxPool
  }

  // check if uncompleted trnx with same params exist in pool
  existTransaction({ sender, recipient }) {
    const transactions = Object.values(this.pool).filter(x => x.status == 'pending')
    return transactions.find(trnx => {
      let actualRecipient = Object.keys(trnx.outputMap)[0]
      if(trnx.input.address == sender && actualRecipient == recipient) return true
    })
  }

  pendingTransactions() {
    return Object.values(this.pool).filter(trnx => {
      if(Transaction.validTransaction(trnx) && trnx.status == 'pending') return true
    })
  }

  validTransactions() {
    return Object.values(this.pool).filter(trnx => Transaction.validTransaction(trnx))
  }

  clearPoolTrnxsInChain(chain) {
    for (let index = 0; index < chain.length; index++) {
      const block = chain[index];
      for(let transaction of block.data) {
        if(this.pool[transaction.id]) {
          delete this.pool[transaction.id]
        }
      }
    }
  }
}

module.exports = TransactionPool;