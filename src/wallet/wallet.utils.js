const crypto = require("crypto")
const { readdirSync, readFileSync, writeFileSync } = require("fs")
const NodeRSA = require("node-rsa")
const { Keccak } = require("sha3")
const { v1 } = require("uuid")
const { chainDataPath } = require("../../helpers")

module.exports = {
  STARTING_BALANCE: 2.99,
  newWalletAddress() {
    const hash = new Keccak(256)
    hash.update(`${v1()}${Date.now()}${Math.floor(Math.random()*999)+1}`)
    return hash.digest('hex').toString()
  },
  loadSavedWallets() {
    const dir = `${chainDataPath}/wallets`
    let self = this;
    const accounts = readdirSync(dir).map(function(data) {
      let address = data.split('__key.dat')[0];
      const keyPair = self.fetchKeyPair(address)
      let balance = self.STARTING_BALANCE
      return { address, ...keyPair, balance }
    })

    return accounts;
  },
  saveWalletPrivateKey({ address, privateKey }) {
    writeFileSync(`${chainDataPath}/wallets/${address}__key.dat`, privateKey)
  },
  fetchKeyPair(address) {
    const keyPair = new NodeRSA()
    keyPair.importKey(readFileSync(`${chainDataPath}/wallets/${address}__key.dat`))
    let privateKey, publicKey;
    publicKey = keyPair.exportKey('pkcs1-public-pem')
    privateKey = keyPair.exportKey('pkcs1-pem')
    return { publicKey, privateKey }
  },
  signTransaction({ senderWallet, data }) {
    return crypto.sign('sha256', Buffer.from(JSON.stringify(data)), {
      key: senderWallet.privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING
    }).toString('hex');
  },
  verifySignature({ address, data, signature }) {
    const { publicKey } = this.fetchKeyPair(address)
    return crypto.verify('sha256', Buffer.from(JSON.stringify(data)), {
        key:publicKey,
        padding:crypto.constants.RSA_PKCS1_PSS_PADDING
    }, Buffer.from(signature, 'hex'))
  }
}