const insight = require('../../api/insight');

const getAddressAddress = async (args, callback) => {
  try {
    const address = args[0] || args.address;
    return callback(null, await insight.getAddressAddress(address));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getAddressAddress;
