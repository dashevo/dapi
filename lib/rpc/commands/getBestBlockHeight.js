const insight = require('../../api/insight');

const getBestBlockHeight = async function getBestBlockHeight(args, callback) {
  try {
    const blockHeight = await insight.getBestBlockHeight();
    return callback(null, blockHeight);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBestBlockHeight;
