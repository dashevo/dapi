const jayson = require('jayson/promise');
const AbstractDashDriveAdapter = require('./AbstractDashDriveAdapter');

class DashDriveAdapter extends AbstractDashDriveAdapter {
  /**
   * @param options
   * @param {string} options.host
   * @param {number} options.port
   */
  constructor(options) {
    super();
    const { host, port } = options;
    this.client = jayson.client.http({ host, port });
  }

  /**
   * Add State Transition Packet to DashDrive storage
   * @param {string} packet - raw data packet serialized to hex string
   * @return {Promise<string>} - packet id
   */
  addSTPacket(packet) {
    return this.client.request('addSTPacket', { packet });
  }

  /**
   * Fetch DAP Contract from DashDrive State View
   * @param {string} dapId
   * @return {Promise<Object>} - Dap contract
   */
  fetchDapContract(dapId) {
    return {};
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
   * @return {Promise<Object[]>}
   */
  fetchDapObjects(dapId, type, options) {
    return [{}];
  }
}

module.exports = DashDriveAdapter;
