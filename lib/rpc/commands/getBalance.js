const insight = require('../../api/insight');

const getBalance = async function getBalance(args, callback) {
  const address = args[0] || args.address;
  try {
    const utxo = await insight.getBalance(address);
    return callback(null, utxo);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBalance;
