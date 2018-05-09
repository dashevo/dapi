const { DashDrive } = require('@dashevo/dash-schema/vmn');
const userIndex = require('../../services/userIndex');

// TODO: temporary dash drive from VMN
const dashDrive = new DashDrive();

// Mock up for virtual drive context
dashDrive.DashCore.getuserbyid = function getUserById(uid) {
  const user = userIndex.getUserById(uid);
  return { blockchainuser: { uname: user.uname } };
};

/**
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
};

module.exports = getUserDapContext;
