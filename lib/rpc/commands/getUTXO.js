const insight = require('../../api/insight');

const getUTXO = async function getUTXO(args, callback) {
  const address = args[0] || args.address;
  try {
    const utxo = await insight.getUTXO(address);
    return callback(null, utxo);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getUTXO;
