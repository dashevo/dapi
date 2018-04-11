const DashDrive = require('@dashevo/dash-schema/vmn');

// TODO: temporary dash drive from VMN
const dashDrive = new DashDrive();

/**
 * Returns user
 * @param args
 * @param callback
 */
const getUserDapContext = async (args, callback) => {
  try {
    const usernameOrRegTxId = args[0];
    const dapId = args[1];
    const dapSpace = dashDrive.getDapContext(dapId, usernameOrRegTxId);
    return callback(null, dapSpace);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getUserDapContext;
