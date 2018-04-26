const RPCError = require('../RPCError');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @return {getUTXO}
 */
const getUTXOFactory = (coreAPI) => {
  /**
   * Returns unspent outputs for the given address
   * @param {object} args
   * @param {string} args.address
   * @return {Promise<Array>}
   * @throws {RPCError}
   */
  async function getUTXO(args) {
    try {
      validator.validate(args);
      const address = args[0] || args.address;
      const UTXO = await coreAPI.getUTXO(address);
      return UTXO;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getUTXO;
};

module.exports = getUTXOFactory;

