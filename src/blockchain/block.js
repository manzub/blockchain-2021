const { GENESIS_DATA, MINE_RATE, cryptoHash } = require("./blockchain.utils");

class Block {
  constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) {
    this.timestamp = timestamp
    this.lastHash = lastHash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    this.difficulty = difficulty
  }

  setNextBlock(block) {
    this.nextBlock = block
  }

  static genesis() {
    return new this(GENESIS_DATA)
  }

  static completeBlock({ block, data}) {
    if((block && data) && typeof data == 'object') {
      let nextBlock = {...block};
      nextBlock.data = [data, ...nextBlock.data];
      let { timestamp, lastHash, nonce, difficulty } = nextBlock
      nextBlock.hash = cryptoHash(timestamp, lastHash, nextBlock.data, nonce, difficulty);
      return new this({ timestamp, lastHash, hash: nextBlock.hash, data: nextBlock.data, nonce, difficulty });
    }
  }

  static createBlock({ lastBlock, data }) {}

  static adjustDifficulty({ originalBlock, timestamp }) {
    const { difficulty } = originalBlock;
    let isMining = ((timestamp - originalBlock.timestamp) <= MINE_RATE)

    if(difficulty < 6) return 6;

    if(isMining) {
      if((timestamp - originalBlock.timestamp) > MINE_RATE) return difficulty - 1;
      return difficulty + 1;
    }else return difficulty;
  }
}

module.exports = Block;