const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getUserDapSpace');

const validator = new Validator(argsSchema);
/**
 * @param dashDrive
 * @return {getUserDapContext}
 */
const getUserDapContextFactory = (dashDrive) => {
  /**
   * Returns user dap space
   * @typedef getUserDapContext
   * @param args - command arguments
   * @param {string} args.dapId
   * @param {string} [args.username]
   * @param {string} [args.userId]
   * @return {Promise<object>}
   */
  async function getUserDapContext(args) {
    validator.validate(args);
    const dapId = args[0] || args.dapId;
    const usernameOrRegTxId = args[1] || args.username || args.userId;
    return dashDrive.getDapContext(dapId, usernameOrRegTxId);
  }
  return getUserDapContext;
};

module.exports = getUserDapContextFactory;
