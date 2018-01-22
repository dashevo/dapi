const getUser = require('./commands/getUser');
const sendRawTransition = require('./commands/sendRawTransition');
const getUTXO = require('./commands/getUTXO');
const sendRawTransaction = require('./commands/sendRawTransaciton');
const getBalance = require('./commands/getBalance');
const getBestBlockHeight = require('./commands/getBestBlockHeight');
const getBlockHash = require('./commands/getBlockHash');
const getMNList = require('./commands/getMNList');

const DAPICommands = {
  getUser,
  sendRawTransition,
  sendRawTransaction,
  getUTXO,
  getBalance,
  getBestBlockHeight,
  getBlockHash,
  getMNList,
};

module.exports = DAPICommands;
