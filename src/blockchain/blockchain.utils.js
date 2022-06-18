const crypto = require("crypto");
const { readdirSync, readFileSync, writeFileSync, unlinkSync } = require("fs");
const { chainDataPath } = require("../../helpers");

const GENESIS_DATA = {
  timestamp: 1654847852939,
  lastHash: 'f1r57-3v3rh45h',
  hash: 'r4nd-h45h',
  data: [],
  nonce: 0,
  difficulty: 6
}

function cryptoHash(...inputs) {
  const hash = crypto.createHash('sha256');
  hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '))
  return hash.digest('hex')
}

function addToChain({ transactionPool, blockchain, p2pInstance }, count) {
  // priodic add to blockchain
  if(p2pInstance.nextBlock) {
    const poolLength = Object.values(transactionPool.pool).length
    console.log(poolLength);
    if(poolLength >= 2) {
      const pendingTransactions = transactionPool.pendingTransactions();
      const completedTransactions = pendingTransactions.map(function(transaction) {
        return {...transaction, status: 'complete'}
      });

      blockchain.addBlock({ block: p2pInstance.nextBlock, data: completedTransactions })
      p2pInstance.broadcastChain();
      transactionPool.multiRemoveTransaction(pendingTransactions);
      console.log('Next block added to chain');
      p2pInstance.removeNextBlock()
    } else {
      console.log('Next block ready, awaiting new trasnactions');
    }
  } else {
    // reduce log intervals
    if((count % 3) == 0) {
      if(!p2pInstance.nextBlock && Object.values(transactionPool.pool).length >= 2) {
        console.log('Pending Transactions, Awaiting Miners');
      } else {
        console.log('Worker Ready');
      }
    }
  } 
}

function loadSavedChain() {
  const dir = `${chainDataPath}/blocks`
  const blocks = readdirSync(dir).map(function(data) {
    return JSON.parse(readFileSync(`${dir}/${data}`))
  })
  return blocks;
}

function replaceSavedChain(chain) {
  const dir = `${chainDataPath}/blocks`
  readdirSync(dir).forEach(data => unlinkSync(`${dir}/${data}`))
  chain.forEach(data => saveBlockLocal(data))
}

function saveBlockLocal(block) {
  const serializedBlock = JSON.stringify(block);
  writeFileSync(`${chainDataPath}/blocks/block_${block.timestamp}.dat`, serializedBlock, { flag: 'w' })
}

module.exports = {
  GENESIS_DATA,
  cryptoHash,
  addToChain,
  loadSavedChain,
  replaceSavedChain,
  saveBlockLocal,
  MINE_RATE: 1000
}