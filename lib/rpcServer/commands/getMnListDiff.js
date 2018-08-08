const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);
/**
 * Returns getAddressTotalReceived function
 * @param coreAPI
 * @return {getMnListDiff}
 */
const getMnListDiffFactory = (coreAPI) => {
  /**
   * Returns calculated balance for the address
   * @typedef getBalance
   * @param args - command arguments
   * @param {string}
   * @return {Promise<number>}
   */
  async function getMnListDiff(args) {
    validator.validate(args);
    const { baseBlockHash, blockHash } = args;
    return coreAPI.getMnListDiff(baseBlockHash, blockHash);
  }

  return getMnListDiff;
};

module.exports = getMnListDiffFactory;
