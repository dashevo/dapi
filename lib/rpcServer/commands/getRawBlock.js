const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getRawBlock');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @return {getRawBlock}
 */
const getRawBlockFactory = (coreAPI) => {
  // Todo: document summary format
  /**
   * Returns raw block for the given block hash
   * @param {object} args
   * @param {string} args.blockHash
   * @return {Promise<object>}
   * @throws {RPCError}
   */
  async function getRawBlock(args) {
    try {
      validator.validate(args);
      const blockHash = args[0] || args.blockHash;
      const rawBlock = await coreAPI.getRawBlock(blockHash);
      return rawBlock;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getRawBlock;
};

module.exports = getRawBlockFactory;
