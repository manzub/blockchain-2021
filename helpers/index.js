const path = require("path")
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { v4 } = require("uuid");
const adapter = new FileSync(path.dirname(__filename)+'/data.json')
const database = low(adapter);

database.defaults({ miners: [] }).write();

module.exports = {
  registerMiner({ address, passKey }) {
    let apiKey = v4();
    database.get('miners').push({ address, passKey, apiKey }).write();
    return !!database.get('miners').find({ address, passKey }).value();
  },
  existingMiner({ address, passKey }) {
    const item = database.get('miners').find({ address, passKey }).value();
    return item;
  }
}