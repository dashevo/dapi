const DashDrive = require('@dashevo/dash-schema/vmn');

// TODO: temporary dash drive from VMN
const dashDrive = new DashDrive();

/**
 * Returns user
 * @param args
 * @param callback
 */
const getDapContract = async (args, callback) => {
  try {
    const dapId = args[0];
    const dapContract = await dashDrive.getDapContract(dapId);
    return callback(null, dapContract);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getDapContract;
