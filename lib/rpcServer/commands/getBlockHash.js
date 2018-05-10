const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getBlockHash');

const validator = new Validator(argsSchema);

/**
 * @param {Object} coreAPI
 * @return {getBlockHash}
 */
const getBlockHashFactory = (coreAPI) => {
  /**
   * Returns block hash for the given height
   * @typedef getBlockHash
   * @param args
   * @param {number} args.height - block height
   * @return {Promise<string>} - block hash
   */
  async function getBlockHash(args) {
    validator.validate(args);
    const blockHeight = args[0] || args.height;
    return coreAPI.getBlockHash(blockHeight);
  }

  return getBlockHash;
};

module.exports = getBlockHashFactory;
