const insight = require('../../api/insight');

const getRawBlock = async (args, callback) => {
  try {
    const blockHash = args[0] || args.blockHash;
    return callback(null, await insight.getRawBlock(blockHash));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getRawBlock;
