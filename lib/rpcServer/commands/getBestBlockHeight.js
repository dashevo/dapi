const RPCError = require('../RPCError');
/**
 * Returns getAddressTotalReceived function
 * @param coreAPI
 * @return {getBestBlockHeight}
 */
const getBestBlockHeightFactory = (coreAPI) => {
  /**
   * Returns best block height
   * @return {Promise<number>} - best seen block height
   * @throws {RPCError}
   */
  async function getBestBlockHeight() {
    try {
      const bestBlockHeight = await coreAPI.getBestBlockHeight();
      return bestBlockHeight;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getBestBlockHeight;
};

module.exports = getBestBlockHeightFactory;
