const insight = require('../../api/insight');

const estimateFee = async (args, callback) => {
  try {
    const nbBlocks = args[0] || args.nbBlocks;
    return callback(null, await insight.estimateFee(nbBlocks));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = estimateFee;
