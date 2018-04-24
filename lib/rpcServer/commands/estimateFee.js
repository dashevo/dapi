const RPCError = require('../RPCError');

/**
 *
 * @param coreAPI
 * @return {estimateFee}
 */
const estimateFeeFactory = (coreAPI) => {
  /**
   * Estimates fee for a given number of blocks
   * @param {object} args
   * @param {number} args.nbBlocks
   * @return {Promise<number>}
   * @throws RPCError
   */
  async function estimateFee(args) {
    try {
      const nbBlocks = args[0] || args.nbBlocks;
      const fee = await coreAPI.estimateFee(nbBlocks);
      return fee;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return estimateFee;
};

module.exports = estimateFeeFactory;
