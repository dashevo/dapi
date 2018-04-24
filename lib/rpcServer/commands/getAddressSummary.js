const RPCError = require('../RPCError');

/**
 * @param coreAPI
 * @return {getAddressSummary}
 */
const getAddressSummaryFactory = (coreAPI) => {
  // Todo: document summary format
  /**
   * Returns address summary
   * @param {object} args
   * @param {string} args.address
   * @return {Promise<*>}
   * @throws {RPCError}
   */
  async function getAddressSummary(args) {
    try {
      const address = args[0] || args.address;
      const summary = await coreAPI.getAddressSummary(address);
      return summary;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getAddressSummary;
};

module.exports = getAddressSummaryFactory;
