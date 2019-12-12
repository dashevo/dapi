const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  FetchIdentityResponse,
} = require('@dashevo/dapi-grpc');

/**
 *
 * @param {jaysonClient} rpcClient
 * @param {handleAbciResponse} handleAbciResponse
 * @returns {fetchIdentityHandler}
 */
function getIdentityHandlerFactory(rpcClient, handleAbciResponse) {
  /**
   * @typedef fetchIdentityHandler
   * @param {Object} call
   */
  async function fetchIdentityHandler(call) {
    const { request } = call;

    const id = request.getId();

    if (!id) {
      throw new InvalidArgumentGrpcError('id is not specified');
    }

    const path = '/identity';

    const data = Buffer.from(id).toString('hex');

    let result;
    let error;
    try {
      ({ result, error } = await rpcClient.request('abci_query', { path, data }));
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    if (error) {
      throw new InternalGrpcError(error);
    }

    handleAbciResponse(result.response);

    const { response: { value: identityBase64 } } = result;

    const response = new FetchIdentityResponse();

    response.setIdentity(identityBase64);

    return response;
  }

  return fetchIdentityHandler;
}

module.exports = getIdentityHandlerFactory;
