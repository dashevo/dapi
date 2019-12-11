const cbor = require('cbor');

const {
  GetTransactionResponse,
} = require('@dashevo/dapi-grpc');

const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

/**
 * @param {InsightAPI} insightAPI
 * @returns {getTransactionHandler}
 */
function getTransactionHandlerFactory(insightAPI) {
  /**
   * @typedef getTransactionHandler
   * @param {Object} call
   * @returns {Promise<GetTransactionResponse>}
   */
  async function getTransactionHandler(call) {
    const { request } = call;

    const id = request.getId();

    if (!id) {
      throw new InvalidArgumentGrpcError('id is not specified');
    }

    let transaction;

    try {
      transaction = await insightAPI.getTransactionById(id);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new GetTransactionResponse();
    response.setTransaction(cbor.encodeCanonical(transaction));

    return response;
  }

  return getTransactionHandler;
}

module.exports = getTransactionHandlerFactory;
