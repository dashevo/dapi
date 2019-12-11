const cbor = require('cbor');

const {
  GetBlockResponse,
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
 * @returns {getBlockHandler}
 */
function getBlockHandlerFactory(insightAPI) {
  /**
   * @typedef getBlockHandler
   * @param {Object} call
   * @return {Promise<GetBlockResponse>}
   */
  async function getBlockHandler(call) {
    const { request } = call;

    const height = request.getHeight();
    const hash = request.getHash();

    if (!hash && !height) {
      throw new InvalidArgumentGrpcError('hash or height is not specified');
    }

    let block;

    try {
      if (hash) {
        block = await insightAPI.getBlockByHash(hash);
      } else {
        block = await insightAPI.getBlockByHeight(height);
      }
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new GetBlockResponse();
    response.setBlock(cbor.encodeCanonical(block));

    return response;
  }

  return getBlockHandler;
}

module.exports = getBlockHandlerFactory;
