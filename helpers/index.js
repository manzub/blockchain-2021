const path = require("path")
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { v4 } = require("uuid");
const { hashSync, compareSync } = require("bcryptjs");
const adapter = new FileSync(path.dirname(__filename)+'/data.json')
const database = low(adapter);

database.defaults({ miners: [] }).write();

module.exports = {
  registerMiner({ address, passKey }) {
    let apiKey = v4();
    // TODO: use bcryptjs
    let hash = hashSync(passKey, 8)
    database.get('miners').push({ address, passKey: hash, apiKey }).write();
    return true;
  },
  existingMiner({ address, passKey }) {
    const item = database.get('miners').find({ address }).value();
    if(item) {
      let isPassword = compareSync(passKey, item?.passKey)
      return isPassword ? item : null;
    }
    return null;
  },
  chainDataPath: `${path.resolve(__dirname, '..')}/chaindata`
}