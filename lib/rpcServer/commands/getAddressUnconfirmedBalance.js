const insight = require('../../api/insight');

const getAddressUnconfirmedBalance = async (args, callback) => {
  try {
    const address = args[0] || args.address;
    return callback(null, await insight.getAddressUnconfirmedBalance(address));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getAddressUnconfirmedBalance;
