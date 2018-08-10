const jayson = require('jayson/promise');
const errorHandlerDecorator = require('./errorHandlerDecorator');

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
const getMnListDiff = require('./commands/getMnListDiff');
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
const loadBloomFilter = require('./commands/loadBloomFilter');
const addToBloomFilter = require('./commands/addToBloomFilter');
const clearBloomFilter = require('./commands/clearBloomFilter');
const getSpvData = require('./commands/getSpvData');
const sendRawIxTransaction = require('./commands/sendRawIxTransaction');

// Following commands don't seem to be working:
// const getAuthChallenge = require('./commands/getAuthChallenge');
// const getCurrency = require('./commands/getCurrency');
// const getMNUpdateList = require('./commands/getMNUpdateList');
// const getVersion = require('./commands/getVersion');

const createCommands = (insightAPI, dashcoreAPI, dashDrive, userIndex) => ({
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
  getMnListDiff: getMnListDiff(dashcoreAPI),
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
  sendRawIxTransaction,
  // getVersion,
  // getAuthChallenge,
  // getCurrency,
  // getMNUpdateList,
});

const createRegtestCommands = dashcoreAPI => ({
  generate: generate(dashcoreAPI),
});

const createCoreP2pServiceCommands = coreP2pService => ({
  loadBloomFilter: loadBloomFilter(coreP2pService.spvService),
  addToBloomFilter: addToBloomFilter(coreP2pService.spvService),
  clearBloomFilter: clearBloomFilter(coreP2pService.spvService),
  getSpvData: getSpvData(coreP2pService.spvService),
  // getMnListDiff: getMnListDiff(coreP2pService.mnListService),
});

/**
  * Starts RPC server
  * @param {number} port - port to listen for incoming RPC connections
  * @param {string} networkType
  * @param {object} spvService
  * @param {object} insightAPI
  * @param {object} dashcoreAPI
  * @param {object} dashDrive
  * @param {object} userIndex
 */
const start =
  (port, networkType, coreP2pService, insightAPI, dashcoreAPI, dashDrive, userIndex) => {
    const coreP2pCommands = createCoreP2pServiceCommands(coreP2pService);
    const commands = createCommands(insightAPI, dashcoreAPI, dashDrive, userIndex);

    const allCommands = networkType === 'regtest' ?
      Object.assign(commands, coreP2pCommands, createRegtestCommands(dashcoreAPI)) :
      Object.assign(commands, coreP2pCommands);

    /*
    Decorate all commands with decorator that will intercept errors and format
    them before passing to user.
    */
    Object.keys(allCommands).forEach((commandName) => {
      allCommands[commandName] = errorHandlerDecorator(allCommands[commandName]);
    });

    const server = jayson.server(allCommands);
    server.http().listen(port);
  };

module.exports = {
  createCommands,
  start,
};
