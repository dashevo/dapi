const cbor = require('cbor');

const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  UpdateStateTransitionResponse,
} = require('@dashevo/dapi-grpc');

/**
 *
 * @param {jaysonClient} rpcClient
 * @returns {updateStateHandler}
 */
function updateStateHandlerFactory(rpcClient) {
  /**
   * @typedef updateStateHandler
   * @param {Object} call
   */
  async function updateStateHandler(call) {
    const { request } = call;
    const stBinary = request.getStateTransition();

    if (!stBinary) {
      throw new InvalidArgumentGrpcError('stateTransition is not specified');
    }

    const stateTransition = Buffer.from(stBinary);

    const tx = cbor.encodeCanonical(stateTransition).toString('base64');

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

    if (checkTx.code > 0) {
      const { error: { message, data } } = JSON.parse(checkTx.log);

      throw new InvalidArgumentGrpcError(message, data);
    }

    if (deliverTx.code > 0) {
      const { error: { message, data } } = JSON.parse(deliverTx.log);

      throw new InvalidArgumentGrpcError(message, data);
    }

    return new UpdateStateTransitionResponse();
  }

  return updateStateHandler;
}

module.exports = updateStateHandlerFactory;
