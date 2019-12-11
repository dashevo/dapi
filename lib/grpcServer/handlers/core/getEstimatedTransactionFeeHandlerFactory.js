const {
  GetEstimatedTransactionFeeResponse,
} = require('@dashevo/dapi-grpc');

const {
  server: {
    error: {
      InternalGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

/**
 * @param {InsightAPI} insightAPI
 * @returns {getEstimatedTransactionFeeHandler}
 */
function getEstimatedTransactionFeeHandlerFactory(insightAPI) {
  const BLOCKS_BY_DEFAULT = 3;

  /**
   * @typedef getEstimatedTransactionFeeHandler
   * @param {Object} call
   * @returns {Promise<GetEstimatedTransactionFeeResponse>}
   */
  async function getEstimatedTransactionFeeHandler(call) {
    const { request } = call;

    let blocks = request.getBlocks();
    if (blocks === null) {
      blocks = BLOCKS_BY_DEFAULT;
    }

    let fee;

    try {
      fee = await insightAPI.estimateFee(blocks);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new GetEstimatedTransactionFeeResponse();
    response.setFee(fee);

    return response;
  }

  return getEstimatedTransactionFeeHandler;
}

module.exports = getEstimatedTransactionFeeHandlerFactory;
