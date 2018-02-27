const insight = require('../../api/insight');

const getBalance = async (args, callback) => {
  try {
    const address = args[0] || args.address;
    return callback(null, await insight.getBalance(address));
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBalance;
