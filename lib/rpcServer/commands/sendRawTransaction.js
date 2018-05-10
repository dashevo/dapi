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
   * @typedef sendRawTransaction
   * @param args - command arguments
   * @param {string} args.rawTransaction - transaction to send
   * @return {Promise<string>} - transaction id
   */
  async function sendRawTransaction(args) {
    validator.validate(args);
    const rawTransaction = args[0] || args.rawTransaction;
    return coreAPI.sendRawTransaction(rawTransaction);
  }

  return sendRawTransaction;
};

module.exports = sendRawTransactionFactory;
