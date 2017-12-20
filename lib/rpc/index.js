const getUser = require('./commands/getUser');
const sendRawTransition = require('./commands/sendRawTransition');
const getUTXO = require('./commands/getUTXO');
const sendRawTransaction = require('./commands/sendRawTransaciton');
const getBalance = require('./commands/getBalance');

const DAPICommands = {
  getUser,
  sendRawTransition,
  sendRawTransaction,
  getUTXO,
  getBalance,
};

module.exports = DAPICommands;
