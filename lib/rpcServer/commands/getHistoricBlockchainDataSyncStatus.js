const RPCError = require('../RPCError');
/**
 * @param coreAPI
 * @return {getBestBlockHeight}
 */
const getHistoricBlockchainDataSyncStatusFactory = (coreAPI) => {
  /**
   * Returns sync status of the node
   * @return {Promise<object>}
   * @throws {RPCError}
   */
  async function getHistoricBlockchainDataSyncStatus() {
    try {
      const syncStatus = await coreAPI.getHistoricBlockchainDataSyncStatus();
      return syncStatus;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getHistoricBlockchainDataSyncStatus;
};

module.exports = getHistoricBlockchainDataSyncStatusFactory;
