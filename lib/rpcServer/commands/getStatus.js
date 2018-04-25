const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getStatus');

const validator = new Validator(argsSchema);
/**
 * @param coreAPI
 * @return {getStatus}
 */
const getStatusFactory = (coreAPI) => {
  /**
   * Returns calculated balance for the address
   * @param {object} args - command arguments
   * @param {string} args.query
   * @return {Promise<*>}
   * @throws {RPCError}
   */
  async function getStatus(args) {
    try {
      validator.validate(args);
      const query = args[0] || args.query;
      const balance = await coreAPI.getStatus(query);
      return balance;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getStatus;
};

module.exports = getStatusFactory;
