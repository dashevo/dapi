const jayson = require('jayson/promise');
const insightAPI = require('../api/insight');

/* Refactored */
const estimateFee = require('./commands/estimateFee');
const getAddressSummary = require('./commands/getAddressSummary');
const getAddressTotalReceived = require('./commands/getAddressTotalReceived');
const getAddressTotalSent = require('./commands/getAddressTotalSent');

// To refactor


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
const getUserDapSpace = require('./commands/getUserDapSpace');
const getUserDapContext = require('./commands/getUserDapContext');
const getDapContract = require('./commands/getDapContract');
const searchDapContracts = require('./commands/searchDapContracts');
const searchUsers = require('./commands/searchUsers');
const loadBloomFilter = require('./commands/loadBloomFilter');
const addToBloomFilter = require('./commands/addToBloomFilter');
const clearBloomFilter = require('./commands/clearBloomFilter');
const getSpvData = require('./commands/getSpvData');
const requestHistoricData = require('./commands/requestHistoricData');

const commands = {
  estimateFee: estimateFee(insightAPI),
  getAddressSummary: getAddressSummary(insightAPI),
  getAddressTotalReceived: getAddressTotalReceived(insightAPI),
  getAddressTotalSent: getAddressTotalSent(insightAPI),
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
  getUserDapSpace,
  getUserDapContext,
  searchDapContracts,
  getDapContract,
  searchUsers,
  loadBloomFilter,
  addToBloomFilter,
  clearBloomFilter,
  getSpvData,
  requestHistoricData,
};

const regtestOnlyCommands = {
  generate,
};

const spvServiceCommands = spvService => ({
  loadBloomFilter: loadBloomFilter(spvService),
  addToBloomFilter: addToBloomFilter(spvService),
  clearBloomFilter: clearBloomFilter(spvService),
  getSpvData: getSpvData(spvService),
  requestHistoricData: requestHistoricData(spvService),
});

/**
 * Starts RPC server
 * @param {number} port - port to listen for incoming RPC connections
 */
const start = (port, networkType, spvService) => {
  const allCommands = networkType === 'regtest' ?
    Object.assign(commands, spvServiceCommands(spvService), regtestOnlyCommands) :
    Object.assign(commands, spvServiceCommands(spvService));

  const server = jayson.server(allCommands);
  server.http().listen(port);
};

module.exports = {
  commands,
  start,
};
