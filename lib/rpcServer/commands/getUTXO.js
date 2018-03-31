const insight = require('../../api/insight');

const getUTXO = async (args, callback) => {
  try {
    const address = args[0] || args.address;
    const utxo = await insight.getUTXO(address);
    return callback(null, utxo);
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getUTXO;
