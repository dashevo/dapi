const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  UpdateStateResponse,
} = require('@dashevo/dapi-grpc');

/**
 *
 * @param {jaysonClient} rpcClient
 * @param {handleResponse} handleResponse
 * @returns {updateStateHandler}
 */
function updateStateHandlerFactory(rpcClient, handleResponse) {
  /**
   * @typedef updateStateHandler
   * @param {Object} call
   */
  async function updateStateHandler(call) {
    const { request } = call;
    const stByteArray = request.getStateTransition();

    if (!stByteArray) {
      throw new InvalidArgumentGrpcError('State Transition is not specified');
    }

    const tx = Buffer.from(stByteArray).toString('base64');

    let result;
    let error;
    try {
      ({ result, error } = await rpcClient.request('broadcast_tx_commit', { tx }));
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    if (error) {
      throw new InternalGrpcError(error);
    }

    const { check_tx: checkTx, deliver_tx: deliverTx } = result;

    handleResponse(checkTx);

    handleResponse(deliverTx);

    return new UpdateStateResponse();
  }

  return updateStateHandler;
}

module.exports = updateStateHandlerFactory;
