const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getBlockHeaders');

const validator = new Validator(argsSchema);
/**
 * @param coreAPI
 * @return {getBlocks}
 */
const getBlockHeadersFactory = (coreAPI) => {
  /**
   * Returns info for blocks
   * @param {object} args - command arguments
   * @param {string} args.offset
   * @param {string} args.limit - number of block headers to return
   * @return {Promise<object[]>}
   * @throws {RPCError}
   */
  async function getBlockHeaders(args) {
    try {
      validator.validate(args);
      const offset = args[0] || args.offset;
      const limit = args[1] || args.limit;
      const blockHeaders = await coreAPI.getBlocks(offset, limit);
      return blockHeaders;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getBlockHeaders;
};

module.exports = getBlockHeadersFactory;
