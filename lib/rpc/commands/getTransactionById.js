const insight = require('../../api/insight');

const getTransactionById = async (args, callback) => {
  try {
    const txid = args[0] || args.txid;
    return callback(null, await insight.getTransactionById(txid));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getTransactionById();
