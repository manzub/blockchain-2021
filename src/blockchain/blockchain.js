const Transaction = require("../transactions/transaction");
const Block = require("./block");
const blockchainUtils = require("./blockchain.utils");

class Blockchain {
  constructor() {
    // TODO: test load saved chain
    this.chain = [Block.genesis(), ...blockchainUtils.loadSavedChain()];
  }

  addBlock({block, data}) {
    const nb = Block.completeBlock({ block, data })
    this.chain.push(nb);
    // TODO: test save new block
    blockchainUtils.saveBlockLocal(nb)

  }

  replaceChain(chain, onSuccess, validTransactions = true) {
    if(chain.length <= this.chain.length) return console.log('longer chain expected')

    if(Blockchain.isValidChain(chain)) {
      if(validTransactions && !this.validTransactionData(chain)) return console.error('invalid chain')

      console.log('replacing existing chain')
      this.chain = chain
      onSuccess && onSuccess();
      // TODO: test replace local chain
      blockchainUtils.replaceSavedChain(chain)
    } else return console.error('invalid chain')
  }

  validTransactionData(chain) {
    let tTransfers = 0;
    for (let index = 0; index < chain.length; index++) {
      const block = chain[index];
      const trnxSet = new Set();
      let rewardTrnxs = 0;
      for(let transaction of block.data) {
        if(transaction.input.address === '*authorized_address*') {
          rewardTrnxs ++
          if(rewardTrnxs > 2) {
            console.error('miner rewards exceed limits')
            return false
          }

          let currMiningReward = Object.values(transaction.outputMap)[0]
          if(currMiningReward > 0.1) {
            currMiningReward = 0.00009; //punish false miners
            console.error('invalid mining reward');
          }
        } else {
          if (!Transaction.validTransaction(transaction)) {
            console.error('Invalid transaction');
            return false;
          }

          if(trnxSet.has(transaction)) {
            console.log('transaction already exists');
            return false
          } else trnxSet.add(transaction)
          tTransfers += transaction.outputMap[transaction.input.address];
        }
      }
    }
    if(tTransfers <= 0) return false;
    return true;
  }

  static isValidChain(chain) {
    if(JSON.stringify(chain[0]) != JSON.stringify(Block.genesis())) return false

    for (let index = 0; index < chain.length; index++) {
      const block = chain[index];
      const { timestamp, lastHash, hash, data, nonce, difficulty } = block;
      const actualLastHash = chain[index-1];
      const lastDifficulty = chain[index-1]

      if(block.lastHash !== actualLastHash) return false
      const validatedHash = blockchainUtils.cryptoHash(timestamp, lastHash, data, nonce, difficulty);
      if(block.hash !== validatedHash) return false
      if(Math.abs(lastDifficulty - difficulty) > 1) return false
    }

    return true
  }
}

module.exports = Blockchain;