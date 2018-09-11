class DashDriveAdapter {
  /**
   * Add State Transition Packet to DashDrive storage
   * @param {string} packet - raw data packet serialized to hex string
   * @return {string} - packet id
   */
  addSTPacket(packet) {
    throw new Error('Not implemented');
  }

  /**
   * Fetch DAP Contract from DashDrive State View
   * @param {string} dapId
   * @return {Object} - Dap contract
   */
  fetchDapContract(dapId) {
    throw new Error('Not implemented');
  }

  /**
   * Fetch DAP Objects from DashDrive State View
   * @param {string} dapId
   * @param {string} type - Dap objects type to fetch
   * @param options
   * @param {Object} options.where - Mongo-like query
   * @param {Object} options.orderBy - Mongo-like sort field
   * @param {number} options.limit - how many objects to fetch
   * @param {number} options.startAt - number of objects to skip
   * @param {number} options.startAfter - exclusive skip
   * @return {Object[]}
   */
  fetchDapObjects(dapId, type, options) {
    throw new Error('Not implemented');
  }
}

module.exports = DashDriveAdapter;
