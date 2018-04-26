const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/estimateFee');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @returns {estimateFee}
 */
const estimateFeeFactory = (coreAPI) => {
  /**
   * @typedef estimateFee
   * @param {object} args
   * @param {number} args.nbBlocks - target
   * @returns {Promise<number>} - fee in duffs per kilobyte
   */
  async function estimateFee(args) {
    validator.validate(args);
    const nbBlocks = args[0] || args.nbBlocks;
    return coreAPI.estimateFee(nbBlocks);
  }
  return estimateFee;
};

module.exports = estimateFeeFactory;
