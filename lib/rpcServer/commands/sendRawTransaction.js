const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/sendRawTransaction');

const validator = new Validator(argsSchema);
/**
 * Sends raw transaction to the network
 * @param coreAPI
 * @return {sendRawTransaction}
 */
const sendRawTransactionFactory = (coreAPI) => {
  /**
   * Returns total amount of duffs sent by the address
   * @param {object} args - command arguments
   * @param {string} args.rawTransaction - transaction to send
   * @return {Promise<string>} - transaction id
   * @throws {RPCError}
   */
  async function sendRawTransaction(args) {
    try {
      validator.validate(args);
      const rawTransaction = args[0] || args.rawTransaction;
      const transactionId = await coreAPI.sendRawTransaction(rawTransaction);
      return transactionId;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return sendRawTransaction;
};

module.exports = sendRawTransactionFactory;
