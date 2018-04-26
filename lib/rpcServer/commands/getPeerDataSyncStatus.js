/**
 * @param coreAPI
 * @returns {getPeerDataSyncStatus}
 */
const getPeerDataSyncStatusFactory = (coreAPI) => {
  /**
   * @typedef getPeerDataSyncStatus;
   * @returns {Promise<object>}
   */
  function getPeerDataSyncStatus() {
    return coreAPI.getPeerDataSyncStatus();
  }

  return getPeerDataSyncStatus;
};

module.exports = getPeerDataSyncStatusFactory;
