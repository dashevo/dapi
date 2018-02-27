const insight = require('../../api/insight');

const getPeerDataSyncStatus = async (args, callback) => {
  try {
    return callback(null, await insight.getPeerDataSyncStatus());
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getPeerDataSyncStatus;
