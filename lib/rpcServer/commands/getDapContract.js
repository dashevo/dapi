const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getDapContract');

const validator = new Validator(argsSchema);
/**
 * @param dashDrive
 * @return {getDapContract}
 */
const getDapContractFactory = (dashDrive) => {
  /**
   * Returns user dap space
   * @typedef getDapContract
   * @param args - command arguments
   * @param {string} args.dapId
   * @return {Promise<object>}
   */
  async function getDapContract(args) {
    validator.validate(args);
    const { dapId } = args;
    return dashDrive.getDapContract(dapId);
  }
  return getDapContract;
};

module.exports = getDapContractFactory;
