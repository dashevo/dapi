const dashcore = require('../../api/dashcore/rpc');

/**
 * WORKS ONLY IN REGTEST MODE.
 * Generates blocks on demand for regression tests.
 * @param {Array|Object} args
 * @param args[0] || args.amount - Number of blocks to generate
 * @param callback
 * @returns {string[]} - hashes of newly generated blocks
 */
const generate = async (args, callback) => {
  try {
    const amount = args[0] || args.amount;
    return callback(null, await dashcore.generate(amount));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = generate;
