const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getBlocks');

const validator = new Validator(argsSchema);
/**
 * Returns getBlocks function
 * @param coreAPI
 * @return {getBlocks}
 */
const getBlocksFactory = (coreAPI) => {
  /**
   * Returns info for blocks
   * @param {object} args - command arguments
   * @param {string} args.blockDate
   * @param {string} args.limit - number of blocks to return
   * @return {Promise<object[]>}
   * @throws {RPCError}
   */
  async function getBlocks(args) {
    try {
      validator.validate(args);
      const limit = args[0] || args.limit;
      const blockDate = args[1] || args.blockDate;
      const blocks = await coreAPI.getBlocks(limit, blockDate);
      return blocks;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getBlocks;
};

module.exports = getBlocksFactory;
