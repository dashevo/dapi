const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getUserDapSpace');

const validator = new Validator(argsSchema);

/**
 * @param dashDrive
 * @param userIndex
 * @return {getUserDapContext}
 */
const getUserDapContextFactory = (dashDrive, userIndex) => {
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
    const { dapId } = args;
    const usernameOrRegTxId = args[0] || args.username || args.userId;
    // TODO: remove this when proper index arrives to core
    await userIndex.updateUsernameIndex();
    return dashDrive.getDapContext(dapId, usernameOrRegTxId);
  }

  return getUserDapContext;
};

module.exports = getUserDapContextFactory;
