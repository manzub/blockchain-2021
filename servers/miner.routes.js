const { existingMiner, registerMiner } = require('../helpers');
const { apiResponse } = require('../helpers/network');


module.exports = function(app, blockchain, transactionPool, p2pInstance, wallet) {
  app.post('/miner/register', function(req, res) {
    const { address, passKey } = req.body;
    if(address != '' && wallet.accounts.find(x => x.address == address)) {
      let miner = registerMiner({ address, passKey });
      return res.json(apiResponse({ status: 1, message: miner || 'Error occurred' }))
    }

    return res.json(apiResponse({ status: 0, message: 'Invalid wallet address' }))
  })
  
  app.post('/miner/login', function(req, res) {
    const { address, passKey } = req.body;
    if(address != '' && wallet.accounts.find(x => x.address == address)) {
      // proceed
      let miner = existingMiner(req.body);
      if(miner) {
        return res.json(apiResponse({ status: 1, message: 'Login successfull', data: miner }))
      }
    }
    return res.json(apiResponse({ status: 0, message: 'Invalid Miner Login', data: false }))
  })

  app.get('/miner/rewards/:address', function(req, res) {
    const {address} = req.params;
    let rewards = wallet.calculateMinerRewards({ chain: blockchain.chain, address })
    let walletBalance = wallet.calculateBalance({ chain: blockchain.chain, address });
    let response = apiResponse({ status: 1, data: { rewards: rewards || 0.00, balance: walletBalance || 0.00 } })
    res.json(response)
  })

  app.get('/miner/mine/:address', function(req, res) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' })
    res.end();
  })
}