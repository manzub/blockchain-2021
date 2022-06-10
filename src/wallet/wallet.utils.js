const { Keccak } = require("sha3")
const { v1 } = require("uuid")

module.exports = {
  newWalletAddress() {
    const hash = new Keccak(256)
    hash.update(`${v1()}${Date.now()}${Math.floor(Math.random()*999)+1}`)
    return hash.digest('hex').toString()
  }
}