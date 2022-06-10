const crypto = require("crypto")

function signTransaction({ senderWallet, data }) {
  return crypto.sign('sha256', Buffer.from(JSON.stringify(data)), {
    key: senderWallet.privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING
  }).toString('hex');
}

function verifySignature({ address, data, signature }) {
  const { publicKey } = fetchKeyPair({ address })
  return crypto.verify('sha256', Buffer.from(JSON.stringify(data)), {
      key:publicKey,
      padding:crypto.constants.RSA_PKCS1_PSS_PADDING
  }, Buffer.from(signature, 'hex'))
}

module.exports = {
  signTransaction,
  verifySignature
}