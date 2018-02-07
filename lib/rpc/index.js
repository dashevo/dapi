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

const config = {
  protocol: 'http',
  user: 'dash',
  pass: 'local321',
  host: '127.0.0.1',
  port: 19998
};

let rpcClient = require('bitcoind-rpc-dash')

//Temp global
global.rpc = new rpcClient(config);

module.exports = DAPICommands;