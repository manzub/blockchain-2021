const crypto = require("crypto")

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

module.exports = {
  GENESIS_DATA,
  cryptoHash,
  MINE_RATE: 1000
}