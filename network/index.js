const { apiResponse } = require('../helpers/network');

module.exports = function(app, wallet, blockchain, transactionPool, p2pInstance) {
  app.get('/', (req, res) => res.redirect('/chain'));

  app.get('/chain', function(req, res) {
    let response = apiResponse({ status: 1, data: blockchain.chain });
    res.json(response)
  })

  // TODO: move transaction scanner routes to trnxscanner api

  app.get('/value', function(req, res) {
    let response = apiResponse({ message: 'Token value in USD', data: { rate: 100 } })
    res.json(response)
  })

  app.get('/accounts', function(req, res) {
    // TODO: script account
    const accounts = wallet.accounts.filter(x => x.address != '');
    let data = accounts.map(function(account) {
      return { address: account.address, balance: wallet.calculateBalance({ 
        chain: blockchain.chain, 
        address: account.address }) 
      };
    })
    const response = apiResponse({ status:1, data });
    res.json(response)
  })

  app.post('/accounts/new', function(req, res) {
    const account = wallet.createAccount();
    let response = apiResponse({ status: 1, data: account, message: 'New Account created' })
    res.json(response);
  })

  app.get('/accounts/:address', function(req, res) {
    const address = req.params.address;
    let account = wallet.accounts.find(x => x.address === address);
    if(account) {
      if(account.address != '') {
        const data = { address: account.address, balance: wallet.calculateBalance({ chain: blockchain.chain, address }) }
        let response = apiResponse({ status: 1, data  })
        return res.json(response)
      }
    }
    return res.json(apiResponse({ status: 0, message: 'Invalid Wallet Address' }))
  })

  app.post('/transfer', function(req, res) {
    const { sender, recipient, amount, type } = req.body;
    let response = apiResponse({ status: 0 })
    // TODO: add api keys
    if((amount && recipient) && sender != '') {
      let transaction = transactionPool.existTransaction({ sender, recipient });
      let senderWallet = wallet.accounts.find(account => account.address == sender)
      let gas = amount * 0.01
      try {
        // proceed
        let newTransaction = transaction ? 
          transactionPool.updateTransaction(senderWallet, transaction, recipient, amount, gas) :
          wallet.createTransaction({ chain: blockchain.chain, sender, recipient, amount, gas });
        // TODO: auto miner
        if(newTransaction) {
          transactionPool.addToPool(newTransaction)
          p2pInstance.broadcastTransaction(transaction)
          response.status = 1
          response.data = newTransaction
          response.message = 'New Transaction Created'
        } else response.message = 'An Error Occurred'
      } catch (error) {
        console.trace(error)
        let response = apiResponse({ status: 1, message: error.message })
        return res.json(response)
      }
    } else response.message = 'Incompleted request'
    res.json(response)
  })
};