const insight = require('../../api/insight');

const getBlockHash = async (args, callback) => {
  try {
    const blockHeight = args[0];
    const blockHash = await insight.getBlockHash(blockHeight);
    return callback(null, blockHash);
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getBlockHash;
