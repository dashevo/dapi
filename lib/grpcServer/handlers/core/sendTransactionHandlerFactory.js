const cbor = require('cbor');

const {
  SendTransactionResponse,
} = require('@dashevo/dapi-grpc');


const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * @param {InsightAPI} insightAPI
 * @returns {sendTransactionHandler}
 */
function sendTransactionHandlerFactory(insightAPI) {
  /**
   * @typedef sendTransactionHandler
   * @param {Object} call
   * @returns {Promise<SendTransactionResponse>}
   */
  async function sendTransactionHandler(call) {
    const { request } = call;

    const rawTransactionBinary = request.getTransaction();

    if (!rawTransactionBinary) {
      throw new InvalidArgumentGrpcError('transaction is not specified');
    }

    const rawTransaction = cbor.decode(rawTransactionBinary);

    // check transaction

    let transactionIsValid;
    try {
      const transactionInstance = new Transaction(rawTransaction);

      transactionIsValid = transactionInstance.verify();
    } catch (e) {
      throw new InvalidArgumentGrpcError(`invalid transaction: ${e.message}`);
    }

    if (transactionIsValid !== true) {
      throw new InvalidArgumentGrpcError(`invalid transaction: ${transactionIsValid}`);
    }

    let transactionId;
    try {
      transactionId = await insightAPI.sendTransaction(rawTransaction);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new SendTransactionResponse();
    response.setTransactionId(transactionId);

    return response;
  }

  return sendTransactionHandler;
}

module.exports = sendTransactionHandlerFactory;
