const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @returns {getAddressTotalReceived}
 */
const getAddressTotalReceivedFactory = (coreAPI) => {
  /**
   * Returns total amount of duffs received by address
   * @typedef getAddressTotalReceived
   * @param args - command arguments
   * @param {string} args.address
   * @return {Promise<number>}
   */
  async function getAddressTotalReceived(args) {
    validator.validate(args);
    const address = args[0] || args.address;
    return coreAPI.getAddressTotalReceived(address);
  }
  return getAddressTotalReceived;
};

module.exports = getAddressTotalReceivedFactory;
