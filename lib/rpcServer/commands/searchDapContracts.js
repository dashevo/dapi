const { DashDrive } = require('@dashevo/dash-schema/vmn');

// TODO: temporary dash drive from VMN
const dashDrive = new DashDrive();

/**
 * Returns user
 * @param args
 * @param callback
 */
const searchDapContracts = async (args, callback) => {
  try {
    const pattern = args[0] || args.pattern;
    const contractIds = await dashDrive.searchDapContracts(pattern);
    return callback(null, contractIds);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = searchDapContracts;
