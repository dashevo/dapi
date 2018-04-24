const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);
/**
 * Returns getAddressTotalReceived function
 * @param coreAPI
 * @return {getAddressUnconfirmedBalance}
 */
const getAddressUnconfirmedBalanceFactory = (coreAPI) => {
  /**
   * Returns total unconfirmed balance for the address
   * @param {object} args - command arguments
   * @param {string} args.address
   * @return {Promise<number>}
   * @throws {RPCError}
   */
  async function getAddressUnconfirmedBalance(args) {
    try {
      validator.validate(args);
      const address = args[0] || args.address;
      const unconfirmedBalance = await coreAPI.getAddressUnconfirmedBalance(address);
      return unconfirmedBalance;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getAddressUnconfirmedBalance;
};

module.exports = getAddressUnconfirmedBalanceFactory;
