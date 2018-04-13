const jayson = require('jayson');

const estimateFee = require('./commands/estimateFee');
const getAddressSummary = require('./commands/getAddressSummary');
const getAddressTotalReceived = require('./commands/getAddressTotalReceived');
const getAddressTotalSent = require('./commands/getAddressTotalSent');
const getAddressUnconfirmedBalance = require('./commands/getAddressUnconfirmedBalance');
// const getAuthChallenge = require('./commands/getAuthChallenge');
const getBalance = require('./commands/getBalance');
const getBestBlockHeight = require('./commands/getBestBlockHeight');
const getBlockHash = require('./commands/getBlockHash');
const getBlocks = require('./commands/getBlocks');
// const getCurrency = require('./commands/getCurrency');
const getHistoricBlockchainDataSyncStatus = require('./commands/getHistoricBlockchainDataSyncStatus');
const getMNList = require('./commands/getMNList');
// const getMNUpdateList = require('./commands/getMNUpdateList');
const getPeerDataSyncStatus = require('./commands/getPeerDataSyncStatus');
const getRawBlock = require('./commands/getRawBlock');
const getStatus = require('./commands/getStatus');
const getTransactionById = require('./commands/getTransactionById');
const getTransactionsByAddress = require('./commands/getTransactionsByAddress');
const getUser = require('./commands/getUser');
const getUTXO = require('./commands/getUTXO');
// const getVersion = require('./commands/getVersion');
const postTransactionSendix = require('./commands/postTransactionSendix');
const sendRawTransaction = require('./commands/sendRawTransaction');
const sendRawTransition = require('./commands/sendRawTransition');
const getBlockHeaders = require('./commands/getBlockHeaders');
const generate = require('./commands/generate');

const commands = {
  estimateFee,
  getAddressSummary,
  getAddressTotalReceived,
  getAddressTotalSent,
  getAddressUnconfirmedBalance,
  // getAuthChallenge,
  getBalance,
  getBestBlockHeight,
  getBlockHash,
  getBlocks,
  // getCurrency,
  getHistoricBlockchainDataSyncStatus,
  getMNList,
  // getMNUpdateList,
  getPeerDataSyncStatus,
  getRawBlock,
  getStatus,
  getTransactionById,
  getTransactionsByAddress,
  getUser,
  getUTXO,
  // getVersion,
  postTransactionSendix,
  sendRawTransaction,
  sendRawTransition,
  getBlockHeaders,
};

const regtestOnlyCommands = {
  generate,
};

/**
 * Starts RPC server
 * @param {number} port - port to listen for incoming RPC connections
 */
const start = (port, networkType) => {
  if (networkType === 'regtest') {
    Object.assign(commands, regtestOnlyCommands);
  }
  const server = jayson.server(commands);
  server.http().listen(port);
};

module.exports = {
  commands,
  start,
};
