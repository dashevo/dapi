const {
  v0: {
    BroadcastTransactionResponse,
  },
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
 * @param {CoreRpcClient} coreRPCClient
 * @returns {broadcastTransactionHandler}
 */
function broadcastTransactionHandlerFactory(coreRPCClient) {
  /**
   * @typedef broadcastTransactionHandler
   * @param {Object} call
   * @returns {Promise<BroadcastTransactionResponse>}
   */
  async function broadcastTransactionHandler(call) {
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

    const transactionId = await coreRPCClient.sendRawTransaction(serializedTransaction.toString('hex'));

    const response = new BroadcastTransactionResponse();
    response.setTransactionId(transactionId);

    return response;
  }

  return broadcastTransactionHandler;
}

module.exports = broadcastTransactionHandlerFactory;
