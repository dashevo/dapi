const estimateFeeFactory = coreAPI => async function estimateFee(args) {
  try {
    const nbBlocks = args[0] || args.nbBlocks;
    const fee = await coreAPI.estimateFee(nbBlocks);
    return fee;
  } catch (error) {
    throw { code: 400, message: error.message };
  }
};

module.exports = estimateFeeFactory;
