const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/estimateFee');

const validator = new Validator(argsSchema);

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
      validator.validate(args);
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
