const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getUserDapSpace');
const { DashDrive } = require('@dashevo/dash-schema/vmn');
const userIndex = require('../../services/userIndex');

const validator = new Validator(argsSchema);
// TODO: temporary dash drive from VMN
const dashDrive = new DashDrive();

// Mock up for virtual drive context
dashDrive.DashCore.getuserbyid = function getUserById(uid) {
  const user = userIndex.getUserById(uid);
  return { blockchainuser: { uname: user.uname } };
};

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
 * Returns user
 * @param args
 * @param callback
 */
const getUserDapContext = async (args, callback) => {
  try {
    const usernameOrRegTxId = args[0];
    const dapId = args[1];
    await userIndex.updateUsernameIndex();
    const dapContext = await dashDrive.getDapContext(dapId, usernameOrRegTxId);
    return callback(null, dapContext);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
  return getUserDapContext;
};

module.exports = getUserDapContextFactory;
