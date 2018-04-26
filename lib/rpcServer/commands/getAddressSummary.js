const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @returns {getAddressSummary}
 */
const getAddressSummaryFactory = (coreAPI) => {
  /**
   * @typedef getAddressSummary
   * @param args
   * @param {string} args.address
   * @returns {Promise<object>}
   */
  async function getAddressSummary(args) {
    validator.validate(args);
    const address = args[0] || args.address;
    return coreAPI.getAddressSummary(address);
  }
  return getAddressSummary;
};

module.exports = getAddressSummaryFactory;
