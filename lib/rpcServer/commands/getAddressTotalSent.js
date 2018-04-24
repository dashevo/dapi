const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);
/**
 * Returns getAddressTotalReceived function
 * @param coreAPI
 * @return {getAddressTotalSent}
 */
const getAddressTotalSentFactory = (coreAPI) => {
  /**
   * Returns total amount of duffs sent by the address
   * @param {object} args - command arguments
   * @param {string} args.address
   * @return {Promise<number>}
   * @throws {RPCError}
   */
  async function getAddressTotalSent(args) {
    try {
      validator.validate(args);
      const address = args[0] || args.address;
      const totalSent = await coreAPI.getAddressTotalSent(address);
      return totalSent;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getAddressTotalSent;
};

module.exports = getAddressTotalSentFactory;
