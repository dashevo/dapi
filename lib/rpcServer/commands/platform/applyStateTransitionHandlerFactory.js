const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

/**
 *
 * @param {jaysonClient} rpcClient
 * @param {handleAbciResponse} handleAbciResponse
 * @returns {applyStateTransitionHandler}
 */
function applyStateTransitionHandlerFactory(rpcClient, handleAbciResponse) {
  /**
   * @typedef applyStateTransitionHandler
   * @param {Object} args
   * @param {string} args.stateTransition
   */
  async function applyStateTransitionHandler(args) {
    const { stateTransition } = args;

    if (!stateTransition) {
      throw new InvalidArgumentGrpcError('State Transition is not specified');
    }

    const tx = stateTransition;

    const { result, error: errorMessage } = await rpcClient.request('broadcast_tx_commit', { tx });

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    const { check_tx: checkTx, deliver_tx: deliverTx } = result;

    handleAbciResponse(checkTx);

    handleAbciResponse(deliverTx);

    return true;
  }

  return applyStateTransitionHandler;
}

module.exports = applyStateTransitionHandlerFactory;
