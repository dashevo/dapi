const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getBlockHash');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @return {getBlockHash}
 */
const getBlockHashFactory = (coreAPI) => {
  /**
   * Returns block hash for the given block height
   * @param {object} args
   * @param {number} args.height
   * @return {Promise<string>} - block hash
   * @throws RPCError
   */
  async function getBlockHash(args) {
    try {
      validator.validate(args);
      const blockHeight = args[0] || args.height;
      const blockHash = await coreAPI.getBlockHash(blockHeight);
      return blockHash;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getBlockHash;
};


module.exports = getBlockHashFactory;
