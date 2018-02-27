const insight = require('../../api/insight');

const sendRawTransaction = async (args, callback) => {
  try {
    const rawTransaction = args[0] || args.rawTransaction;
    const txid = await insight.sendRawTransaction(rawTransaction);
    return callback(null, txid);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = sendRawTransaction;
