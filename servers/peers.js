const WebSocket = require('ws');
const { getNetworkAddress } = require('../helpers/network');
const TransactionMiner = require('../src/blockchain/miner');



const envPeers = process.env.PEERS;
const peers = envPeers ? envPeers.split(',') : [];
const DEFAULT_PORT = 5001;
// use a different port if default port already used
const last_peer = peers[peers.length-1] ? peers[peers.length-1].split(':')[2] : false;
const P2P_PORT = last_peer ? Number(last_peer)+2 : DEFAULT_PORT;

const CHANNELS = {
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION',
  MINER: 'MINER'
}

class P2PServer {
  constructor({ blockchain, trnxPool, wallet }) {
    this.wallet = wallet
    this.blockchain = blockchain;
    this.trnxPool = trnxPool
    this.sockets = []
    this.nextBlock = null
  }

  removeNextBlock() {
    this.nextBlock = null
  }

  listen() {
    const server = new WebSocket.Server({ port: P2P_PORT })
    server.on('connection', socket => this.connectSocket(socket))
    this.connectToPeers();

    const networkAddress = getNetworkAddress()[0][0];
    console.log('P2P Connections listening on\n'+
      `ws://${networkAddress}:${P2P_PORT}`+
      `\tws://localhost:${P2P_PORT}\n\n`
    );
  }

  connectToPeers() {
    peers.forEach(peer => {
      let path = `ws${peer.split('http')[1]}`
      const socket = new WebSocket(`${path}/`)
      socket.on('open', ()=>this.connectSocket(socket))
    })
  }

  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('socket connected');
    this.messageHandler(socket);
    this.errorHandler(socket);
    this.sendChain(socket)
  }

  messageHandler(socket) {
    const times = [];
    socket.on('message', message => {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.type) {
        case CHANNELS.BLOCKCHAIN:
          this.blockchain.replaceChain(
            parsedMessage.chain, 
            () => this.trnxPool.clearPoolTrnxsInChain({ chain: parsedMessage.chain })
          );
          break;
        case CHANNELS.TRANSACTION:
          this.trnxPool.addToPool(parsedMessage.transaction)
          break;
        case CHANNELS.MINER:
          const miner = new TransactionMiner({ blockchain:this.blockchain, trnxPool:this.trnxPool })
          const address = parsedMessage.address;
          // proceed
          if(!this.nextBlock) {
            socket.send(JSON.stringify({ type:CHANNELS.MINER, result: `Mining Block`}))
            let result = this.mineBlock(miner, address, times)
            this.nextBlock = result.block;
            socket.send(JSON.stringify({ type: CHANNELS.MINER, result: result.message }))
          }else {
            setTimeout(() => {
              socket.send(JSON.stringify({ type: CHANNELS.MINER, result: 'Waiting for empty new block'}));
            }, 7000);
          }
          break;
      }
    })
  }

  mineBlock(miner, address, times) {
    let prevTimestamp, timeDiff, average;
    prevTimestamp = this.blockchain.chain[this.blockchain.chain.length - 1].timestamp;

    let minerWallet = this.wallet.accounts.find(x => x.address == address)
    let minedBlock = miner.mineNewBlock({ minerWallet: address, reward: 0.001, lastBlock: this.blockchain.chain[this.blockchain.chain.length - 1] })
    // let minedBlock = miner.mineNewBlock({ minerWallet: address, reward: 0.001, lastBlock: this.blockchain.chain[this.blockchain.chain.length - 1], })

    if(minedBlock) {
      timeDiff = minedBlock.timestamp - prevTimestamp
      times.push(timeDiff)
      average = times.reduce((total, num) => total+num)
      return { block: minedBlock, message: `Time to mine block: ${timeDiff}ms, Difficulty: ${minedBlock.difficulty}, Avg Tiem: ${average}` }
    }
  }

  errorHandler(socket) {
    socket.on('error', error => {
      // TODO: do something
    })
  }

  sendChain(socket) {
    socket.send(JSON.stringify({ type: CHANNELS.BLOCKCHAIN, chain: this.blockchain.chain }))
  }

  sendTransaction(socket, transaction) {
    socket.send(JSON.stringify({ type: CHANNELS.TRANSACTION, transaction }))
  }

  broadcastChain() {
    this.sockets.forEach(socket => this.sendChain(socket))
  }
  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction))
  }
}

module.exports = P2PServer;