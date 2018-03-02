const insight = require('../../api/insight');
const isInteger = require('../../utils/isInteger');

const getBlockHeaders = async (args, callback) => {
  try {
    const offset = args[0] || args.offset;
    const limit = args[1] || args.limit;
    if (!isInteger(offset) || !isInteger(limit)) {
      return callback({ code: -32602, message: 'Expect offset and limit to be integers' });
    }
    const blockHash = await insight.getBlockHeaders(offset, limit);
    return callback(null, blockHash);
  } catch (error) {
    return callback({ code: -32603, message: error.message });
  }
};

module.exports = getBlockHeaders;
