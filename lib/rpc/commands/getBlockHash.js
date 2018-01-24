const insight = require('../../api/insight');

const getBlockHash = async function getBlockHash(args, callback) {
  try {
    const blockHeight = args[0];
    const blockHash = await insight.getBlockHash(blockHeight);
    return callback(null, blockHash);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBlockHash;
