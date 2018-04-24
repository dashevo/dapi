const RPCError = require('../RPCError');

const estimateFeeFactory = coreAPI => async function estimateFee(args) {
  try {
    const nbBlocks = args[0] || args.nbBlocks;
    const fee = await coreAPI.estimateFee(nbBlocks);
    return fee;
  } catch (error) {
    throw new RPCError(400, error.message);
  }
};

module.exports = estimateFeeFactory;
