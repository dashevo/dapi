const insight = require('../../insight');

const sendRawTransaction = async function sendRawTransaction(args, callback) {
  const rawTransaction = args[0] || args.rawTransaction;
  try {
    const txid = await insight.sendRawTransaction(rawTransaction);
    return callback(null, txid);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = sendRawTransaction;
