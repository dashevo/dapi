const {
  SendTransactionResponse,
} = require('@dashevo/dapi-grpc');


const {
  server: {
    error: {
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

    const serializedTransactionBinary = request.getTransaction();

    if (!serializedTransactionBinary) {
      throw new InvalidArgumentGrpcError('transaction is not specified');
    }

    const serializedTransaction = Buffer.from(serializedTransactionBinary);

    // check transaction

    let transactionInstance;
    try {
      transactionInstance = new Transaction(serializedTransaction);
    } catch (e) {
      throw new InvalidArgumentGrpcError(`invalid transaction: ${e.message}`);
    }

    const transactionIsValid = transactionInstance.verify();

    if (transactionIsValid !== true) {
      throw new InvalidArgumentGrpcError(`invalid transaction: ${transactionIsValid}`);
    }

    const transactionId = await insightAPI.sendTransaction(transactionInstance.serialize());

    const response = new SendTransactionResponse();
    response.setTransactionId(transactionId);

    return response;
  }

  return sendTransactionHandler;
}

module.exports = sendTransactionHandlerFactory;
