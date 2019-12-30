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
 * @returns {getIdentityHandler}
 */
function getIdentityHandlerFactory(rpcClient, handleAbciResponse) {
  /**
   * @typedef getIdentityHandler
   * @param {Object} args
   */
  async function getIdentityHandler(args) {
    const { id } = args;

    if (!id) {
      throw new InvalidArgumentGrpcError('id is not specified');
    }

    const path = '/identity';

    const data = Buffer.from(id).toString('hex');

    const { result, error: errorMessage } = await rpcClient.request('abci_query', { path, data });

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    handleAbciResponse(result.response);

    const { response: { value: identityBase64 } } = result;

    return { identity: identityBase64 };
  }

  return getIdentityHandler;
}

module.exports = getIdentityHandlerFactory;
