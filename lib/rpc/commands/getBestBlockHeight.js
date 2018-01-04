const insight = require('../../api/insight');

const getBestBlockHeight = async function getBestBlockHeight(args, callback) {
  try {
    const utxo = await insight.getBestBlockHeight();
    return callback(null, utxo);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBestBlockHeight;
