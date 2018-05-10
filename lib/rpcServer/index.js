const jayson = require('jayson/promise');
const insightAPI = require('../api/insight');
const dashcoreAPI = require('../api/dashcore/rpc');
const { DashDrive } = require('@dashevo/dash-schema/vmn');
const userIndex = require('../services/userIndex');
const errorHandlerDecorator = require('./errorHandlerDecorator');

// Emulated dd.
const dashDrive = new DashDrive();
// Mock up for virtual drive context
dashDrive.DashCore.getuserbyid = function getUserById(uid) {
  const user = userIndex.getUserById(uid);
  return { blockchainuser: { uname: user.uname } };
};

/* Refactored */
const estimateFee = require('./commands/estimateFee');
const getAddressSummary = require('./commands/getAddressSummary');
const getAddressTotalReceived = require('./commands/getAddressTotalReceived');
const getAddressTotalSent = require('./commands/getAddressTotalSent');
const getAddressUnconfirmedBalance = require('./commands/getAddressUnconfirmedBalance');
const getBalance = require('./commands/getBalance');
const getBestBlockHeight = require('./commands/getBestBlockHeight');
const getBlockHash = require('./commands/getBlockHash');
const getBlocks = require('./commands/getBlocks');
const getHistoricBlockchainDataSyncStatus = require('./commands/getHistoricBlockchainDataSyncStatus');
const getMNList = require('./commands/getMNList');
const getPeerDataSyncStatus = require('./commands/getPeerDataSyncStatus');
const getRawBlock = require('./commands/getRawBlock');
const getStatus = require('./commands/getStatus');
const getTransactionById = require('./commands/getTransactionById');
const getTransactionsByAddress = require('./commands/getTransactionsByAddress');
const getUser = require('./commands/getUser');
const getUTXO = require('./commands/getUTXO');
const getBlockHeaders = require('./commands/getBlockHeaders');
const sendRawTransaction = require('./commands/sendRawTransaction');
const generate = require('./commands/generate');
const sendRawTransition = require('./commands/sendRawTransition');
const getUserDapSpace = require('./commands/getUserDapSpace');
const getUserDapContext = require('./commands/getUserDapContext');
const getDapContract = require('./commands/getDapContract');
const searchDapContracts = require('./commands/searchDapContracts');
const searchUsers = require('./commands/searchUsers');

// To refactor

const loadBloomFilter = require('./commands/loadBloomFilter');
const addToBloomFilter = require('./commands/addToBloomFilter');
const clearBloomFilter = require('./commands/clearBloomFilter');
const getSpvData = require('./commands/getSpvData');
const requestHistoricData = require('./commands/requestHistoricData');

// TODO: it looks like this method does something it doesn't intended to do.
// Task in Jira for investigation created.
// const postTransactionSendix = require('./commands/postTransactionSendix');

// const getAuthChallenge = require('./commands/getAuthChallenge');
// const getCurrency = require('./commands/getCurrency');
// const getMNUpdateList = require('./commands/getMNUpdateList');
// const getVersion = require('./commands/getVersion');

const commands = {
  estimateFee: estimateFee(insightAPI),
  getAddressSummary: getAddressSummary(insightAPI),
  getAddressTotalReceived: getAddressTotalReceived(insightAPI),
  getAddressTotalSent: getAddressTotalSent(insightAPI),
  getAddressUnconfirmedBalance: getAddressUnconfirmedBalance(insightAPI),
  getBalance: getBalance(insightAPI),
  getBestBlockHeight: getBestBlockHeight(insightAPI),
  getBlockHash: getBlockHash(insightAPI),
  getBlocks: getBlocks(insightAPI),
  getHistoricBlockchainDataSyncStatus: getHistoricBlockchainDataSyncStatus(insightAPI),
  getMNList: getMNList(insightAPI),
  getPeerDataSyncStatus: getPeerDataSyncStatus(insightAPI),
  getRawBlock: getRawBlock(insightAPI),
  getStatus: getStatus(insightAPI),
  getTransactionById: getTransactionById(insightAPI),
  getTransactionsByAddress: getTransactionsByAddress(insightAPI),
  getUser: getUser(insightAPI),
  getUTXO: getUTXO(insightAPI),
  getBlockHeaders: getBlockHeaders(insightAPI),
  sendRawTransaction: sendRawTransaction(insightAPI),
  sendRawTransition: sendRawTransition(dashcoreAPI, dashDrive),
  getUserDapSpace: getUserDapSpace(dashDrive),
  getUserDapContext: getUserDapContext(dashDrive, userIndex),
  getDapContract: getDapContract(dashDrive),
  searchDapContracts: searchDapContracts(dashDrive),
  searchUsers: searchUsers(userIndex),

  loadBloomFilter,
  addToBloomFilter,
  clearBloomFilter,
  getSpvData,
  requestHistoricData,

  // postTransactionSendix,
  // getVersion,
  // getAuthChallenge,
  // getCurrency,
  // getMNUpdateList,
};

const regtestOnlyCommands = {
  generate: generate(dashcoreAPI),
};

const spvServiceCommands = spvService => ({
  loadBloomFilter: loadBloomFilter(spvService),
  addToBloomFilter: addToBloomFilter(spvService),
  clearBloomFilter: clearBloomFilter(spvService),
  getSpvData: getSpvData(spvService),
  requestHistoricData: requestHistoricData(spvService),
});

/*
Decorate all commands with decorator that will intercept errors and format
them before passing to user.
 */
Object.keys(commands).forEach((commandName) => {
  commands[commandName] = errorHandlerDecorator(commands[commandName]);
});

/**
 * Starts RPC server
 * @param {number} port - port to listen for incoming RPC connections
 * @param {string} networkType
 * @param {object} spvService
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
