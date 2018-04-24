const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);
/**
 * Returns getAddressTotalReceived function
 * @param coreAPI
 * @return {getAddressTotalReceived}
 */
const getAddressTotalReceivedFactory = (coreAPI) => {
  /**
   * Returns total amount of duffs received by address
   * @param {object} args - command arguments
   * @param {string} args.address
   * @return {Promise<number>}
   * @throws {RPCError}
   */
  async function getAddressTotalReceived(args) {
    try {
      validator.validate(args);
      const address = args[0] || args.address;
      const totalReceived = await coreAPI.getAddressTotalReceived(address);
      return totalReceived;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getAddressTotalReceived;
};

module.exports = getAddressTotalReceivedFactory;
