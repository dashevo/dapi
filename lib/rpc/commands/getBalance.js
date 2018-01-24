const insight = require('../../api/insight');

const getBalance = async function getBalance(args, callback) {
  try {
    const address = args[0] || args.address;
    const balance = await insight.getBalance(address);
    return callback(null, balance);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBalance;
