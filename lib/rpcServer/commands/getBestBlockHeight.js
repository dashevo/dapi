const insight = require('../../api/insight');

const getBestBlockHeight = async (args, callback) => {
  try {
    const blockHeight = await insight.getBestBlockHeight();
    return callback(null, blockHeight);
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getBestBlockHeight;
