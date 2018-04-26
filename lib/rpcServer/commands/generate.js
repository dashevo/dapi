const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/generate');

const validator = new Validator(argsSchema);
/**
 * @param coreAPI
 * @return {generate}
 */
const generateFactory = (coreAPI) => {
  /**
   * WORKS ONLY IN REGTEST MODE.
   * Generates blocks on demand for regression tests.
   * @param {object} args - command arguments
   * @param {number} args.amount - amount of blocks to generate
   * @return {Promise<string[]>} - generated block hashes
   * @throws {RPCError}
   */
  async function generate(args) {
    try {
      validator.validate(args);
      const amount = args[0] || args.amount;
      const blockHashes = await coreAPI.generate(amount);
      return blockHashes;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return generate;
};

module.exports = generateFactory;
