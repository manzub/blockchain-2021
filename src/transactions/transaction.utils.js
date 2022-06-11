const { readdirSync, readFileSync, writeFileSync, unlinkSync } = require("fs")
const { chainDataPath } = require("../../helpers")

module.exports = {
  loadSavedTrnxPool() {
    let trnxPool = readdirSync(`${chainDataPath}/trnx_pool`).reduce(function(map, data) {
      const parsedTransaction = JSON.parse(readFileSync(`${chainDataPath}/trnx_pool/${data}`))
      map[parsedTransaction.id] = parsedTransaction
      return map;
    }, {})

    return trnxPool;
  },
  saveTransactionToLocal(transaction) {
    const serializedTrnx = JSON.stringify(transaction);
    writeFileSync(`${chainDataPath}/trnx_pool/${transaction.id}.dat`, serializedTrnx, { flag: 'w' })
  },
  updateLocalTrnx(transaction, option) {
    let path = `${chainDataPath}/trnx_pool/${transaction.id}.dat`
    if(readFileSync(path)) {
      unlinkSync(path)
      (option && option != 'delete') && writeFileSync(path, JSON.stringify(transaction), { flag: 'w' })
    }
  }
}