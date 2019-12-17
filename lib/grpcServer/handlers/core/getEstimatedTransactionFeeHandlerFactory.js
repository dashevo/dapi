const {
  GetEstimatedTransactionFeeResponse,
} = require('@dashevo/dapi-grpc');

/**
 * @param {InsightAPI} insightAPI
 * @returns {getEstimatedTransactionFeeHandler}
 */
function getEstimatedTransactionFeeHandlerFactory(insightAPI) {
  /**
   * @typedef getEstimatedTransactionFeeHandler
   * @param {Object} call
   * @returns {Promise<GetEstimatedTransactionFeeResponse>}
   */
  async function getEstimatedTransactionFeeHandler(call) {
    const { request } = call;

    const blocks = request.getBlocks();

    const fee = await insightAPI.estimateFee(blocks);

    const response = new GetEstimatedTransactionFeeResponse();
    response.setFee(fee);

    return response;
  }

  return getEstimatedTransactionFeeHandler;
}

module.exports = getEstimatedTransactionFeeHandlerFactory;
