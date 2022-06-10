const { existingMiner } = require('../helpers');
const { apiResponse } = require('../helpers/network');
const TransactionMiner = require('../src/blockchain/miner');



module.exports = function(app, blockchain, transactionPool, p2pInstance, wallet) {
  // const miner = new TransactionMiner({ blockchain, trnxPool: transactionPool, p2pInstance })
  app.post('/miner/login', function(req, res) {
    const { address, passKey } = req.body;
    // if(address != '' && wallet.accounts.find(x => x.address == address)) {
      // proceed
      let miner = existingMiner(req.body);
      if(miner) {
        return res.json(apiResponse({ status: 1, message: 'Login successfull', data: miner }))
      }
    // }
    return res.json(apiResponse({ status: 0, message: 'Invalid Miner Login', data: false }))
  })

  app.get('/miner/rewards/:address', function(req, res) {
    const address = req.params;
    let rewards = wallet.calculateMinerRewards({ chain: blockchain.chain, address })
    let walletBalance = wallet.calculateBalance({ chain: blockchain.chain, address });
    let response = apiResponse({ status: 1, data: { rewards: rewards || 0.00, balance: walletBalance || 0.00 } })
    res.json(response)
  })

  app.get('/miner/mine/:address', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' })
    // const times = [];
    // let prevTimestamp, nextTimestamp, timeDiff, nextBlock, average;
    // let pool = Object.values(transactionPool.pool);
    // prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;


    // for (let i = 0; i < 4; i++) {
    //   let minerWallet = req.params.address
    //   let result = miner.mineNewBlock({ minerWallet, lastBlock: blockchain.chain[blockchain.chain.length -1], reward: 0.001 });
    //   if(result) {
    //     blockchain.addBlock({ block: result, data: {name:'sdsds'} })
    //     nextBlock = blockchain.chain[blockchain.chain.length-1];
    //     nextTimestamp = nextBlock.timestamp;
    //     timeDiff = nextTimestamp - prevTimestamp
    //     times.push(timeDiff)
    //     average = times.reduce((total,num)=>(total+num)) / times.length;

    //     res.write(`Time to mine block: ${timeDiff}ms, Difficulty: ${nextBlock.difficulty}, Average Time: ${average}`);
    //   }
    // }
    res.end();
  })
}