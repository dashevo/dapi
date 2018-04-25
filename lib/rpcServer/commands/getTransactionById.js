const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getTransactionById');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @return {getTransactionById}
 */
const getTransactionByIdFactory = (coreAPI) => {
  /**
   * Returns transaction for the given hash
   * @param {object} args
   * @param {string} args.txid
   * @return {Promise<object>}
   * @throws {RPCError}
   */
  async function getTransactionById(args) {
    try {
      validator.validate(args);
      const txid = args[0] || args.txid;
      const transaction = await coreAPI.getTransactionById(txid);
      return transaction;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getTransactionById;
};

module.exports = getTransactionByIdFactory;
