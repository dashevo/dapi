const RPCError = require('../RPCError');

const getAddressSummaryFactory = coreAPI => async function getAddressSummary(args) {
  try {
    const address = args[0] || args.address;
    const summary = await coreAPI.getAddressSummary(address);
    return summary;
  } catch (error) {
    throw new RPCError(400, error.message);
  }
};

module.exports = getAddressSummaryFactory;
