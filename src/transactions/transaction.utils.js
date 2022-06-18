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
  },
  removeLocalTrnxMany(transactions) {
    let dir = `${chainDataPath}/trnx_pool`;
    readdirSync(dir).forEach(file => {
      let trnxId = file.split('.dat')[0];
      if(transactions.find(x => x.id == trnxId)) {
        unlinkSync(`${dir}/${file}`)
      }
    })
  }
}