const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/address');

const validator = new Validator(argsSchema);
/**
 * @param dashDrive
 * @return {getUserDapSpace}
 */
const getUserDapSpaceFactory = (dashDrive) => {
  /**
   * Returns user dap space
   * @typedef getUserDapSpace
   * @param args - command arguments
   * @param {string} args.dapId
   * @param {string} [args.username]
   * @param {string} [args.userId]
   * @return {Promise<number>}
   * @throws {RPCError}
   */
  async function getUserDapSpace(args) {
    validator.validate(args);
    const usernameOrRegTxId = args[0] || args.username || args.userId;
    const dapId = args[1] || args.dapId;
    return dashDrive.getDapSpace(dapId, usernameOrRegTxId);
  }
  return getUserDapSpace;
};

module.exports = getUserDapSpaceFactory;
