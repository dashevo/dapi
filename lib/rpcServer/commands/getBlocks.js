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
   * @typedef getBlocks
   * @param args - command arguments
   * @param {string} args.blockDate
   * @param {string} args.limit - number of blocks to return
   * @return {Promise<object[]>}
   */
  async function getBlocks(args) {
    validator.validate(args);
    const limit = args[0] || args.limit;
    const blockDate = args[1] || args.blockDate;
    return coreAPI.getBlocks(limit, blockDate);
  }

  return getBlocks;
};

module.exports = getBlocksFactory;
