const crypto = require('crypto');

const {
  server: {
    error: {
      InvalidArgumentGrpcError,
      FailedPreconditionGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    BroadcastStateTransitionResponse,
  },
} = require('@dashevo/dapi-grpc');

const AbciResponseError = require('../../../errors/AbciResponseError');

/**
 * @param {jaysonClient} rpcClient
 * @param {handleAbciResponseError} handleAbciResponseError
 *
 * @returns {broadcastStateTransitionHandler}
 */
function broadcastStateTransitionHandlerFactory(rpcClient, handleAbciResponseError) {
  /**
   * @typedef broadcastStateTransitionHandler
   *
   * @param {Object} call
   *
   * @return {Promise<BroadcastStateTransitionResponse>}
   */
  async function broadcastStateTransitionHandler(call) {
    const { request } = call;
    const stByteArray = request.getStateTransition();

    if (!stByteArray) {
      throw new InvalidArgumentGrpcError('State Transition is not specified');
    }

    const hashString = crypto.createHash('sha256')
      .update(stByteArray)
      .digest()
      .toString('hex');

    console.log(`[${new Date()}]: broadcasting ST ${hashString}`);

    const tx = Buffer.from(stByteArray).toString('base64');

    console.log(`[${new Date()}]: Doing broadcast tx sync ${hashString}`);
    const { result } = await rpcClient.request('broadcast_tx_sync', { tx });

    console.log(`[${new Date()}]: Got sync broadcast result for ${hashString}`);
    console.dir(result);

    const { error: jsonRpcError } = result;

    if (jsonRpcError) {
      if (jsonRpcError.data === 'tx already exists in cache') {
        throw new FailedPreconditionGrpcError(jsonRpcError.data, jsonRpcError);
      }

      const error = new Error();
      Object.assign(error, jsonRpcError);

      throw error;
    }

    console.log(`[${new Date()}]: Checking for ABCI errors ${hashString}`);
    if (result.code !== undefined && result.code !== 0) {
      console.log(`[${new Date()}]: ABCI error found ${hashString}:`);
      const { error: abciError } = JSON.parse(result.log);
      console.dir(abciError);

      handleAbciResponseError(
        new AbciResponseError(result.code, abciError),
      );
    }

    console.log(`[${new Date()}]: ST ${hashString} broadcasted`);
    return new BroadcastStateTransitionResponse();
  }

  return broadcastStateTransitionHandler;
}

module.exports = broadcastStateTransitionHandlerFactory;
