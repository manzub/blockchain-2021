// TODO: check process.env.debug=true
const express = require("express");
const cors = require("cors")
const { getNetworkAddress } = require("./helpers/network");
// modules
const Blockchain = require('./src/blockchain/blockchain');
const TransactionPool = require('./src/transactions/trnx.pool');
const Wallet = require('./src/wallet/wallet');
const P2PServer = require('./network/peers');

// initialize imports
const app = express();

const transactionPool = new TransactionPool();
const blockchain = new Blockchain();
const wallet = new Wallet();
const p2pInstance = new P2PServer({ blockchain, trnxPool: transactionPool, wallet });

// configs
const DEFAULT_PORT = 3001;
const randPort = Math.floor(Math.random()*9999);
const HTTP_PORT =  process.env.PEERS ? randPort : DEFAULT_PORT;

app.use(require("morgan")("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

require('./network/index')(app, wallet, blockchain, transactionPool, p2pInstance)
require('./network/miner.routes')(app, blockchain, transactionPool, p2pInstance, wallet)

// default page not found route
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

// listen p2p
p2pInstance.listen();
// listen http
app.listen(HTTP_PORT, () => {
  // do some things
  const networkAddress = getNetworkAddress()[0][0];
  console.log('HTTP Server listening on\n'+
    `http://${networkAddress}:${HTTP_PORT}`+
    `\thttp://localhost:${HTTP_PORT}`
  );
})
// priodic add to blockchain
setInterval(() => {
  if(p2pInstance.nextBlock) {
    const pendingTransactions = transactionPool.pendingTransactions();
    
  }
}, 5000);