const {
  GetEstimatedTransactionFeeResponse,
} = require('@dashevo/dapi-grpc');

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
    if (!blocks) {
      blocks = BLOCKS_BY_DEFAULT;
    }

    const fee = await insightAPI.estimateFee(blocks);

    const response = new GetEstimatedTransactionFeeResponse();
    response.setFee(fee);

    return response;
  }

  return getEstimatedTransactionFeeHandler;
}

module.exports = getEstimatedTransactionFeeHandlerFactory;
