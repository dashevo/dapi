const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);
/**
 * Returns getAddressTotalReceived function
 * @param coreAPI
 * @return {getBalance}
 */
const getBalanceFactory = (coreAPI) => {
  /**
   * Returns calculated balance for the address
   * @param {object} args - command arguments
   * @param {string} args.address
   * @return {Promise<number>}
   * @throws {RPCError}
   */
  async function getBalance(args) {
    try {
      validator.validate(args);
      const address = args[0] || args.address;
      const balance = await coreAPI.getBalance(address);
      return balance;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getBalance;
};

module.exports = getBalanceFactory;
