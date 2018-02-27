const insight = require('../../api/insight');

const getBlocks = async function getBlocks(args, callback) {
  try {
    const limit = args[0] || args.address;
    const blockDate = args[1] || args.blockDate;
    return callback(null, await insight.getBlocks(limit, blockDate));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getBlocks;
