const hexToBinary = require("hex-to-binary");
const Transaction = require("../transactions/transaction");
const Block = require("./block");
const { cryptoHash } = require("./blockchain.utils");

class Miner {
  constructor({ blockchain, trnxPool }) {
    this.blockchain = blockchain
    this.trnxPool = trnxPool
  }

  mineNewBlock({ minerWallet, lastBlock, reward }) {
    const lastHash = lastBlock.hash;
    let { difficulty } = lastBlock;
    let hash, timestamp, nonce = 0;
    let data = [Transaction.rewardTransaction({ minerWallet, reward })]
    do {
      nonce++;
      timestamp = Date.now();
      difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp })
      hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty)
    } while (hexToBinary(hash).substring(0, difficulty) != '0'.repeat(difficulty));
    return new Block({ timestamp, lastHash, hash, data, nonce, difficulty })
  }
}

module.exports = Miner;