const {
  GetBlockResponse,
} = require('@dashevo/dapi-grpc');

const { Block } = require('@dashevo/dashcore-lib');

const {
  server: {
    error: {
      InvalidArgumentGrpcError,
      InternalGrpcError,
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

    let serializedBlock;
    let blockData;

    if (hash) {
      try {
        serializedBlock = await insightAPI.getRawBlockByHash(hash);
      } catch (e) {
        if (e.statusCode === 404) {
          throw new InvalidArgumentGrpcError('Block hash is not found');
        }

        throw new InternalGrpcError(e);
      }
    } else {
      try {
        serializedBlock = await insightAPI.getRawBlockByHeight(height);
      } catch (e) {
        if (e.statusCode === 400) {
          throw new InvalidArgumentGrpcError('Block height is not found');
        }

        throw new InternalGrpcError(e);
      }
    }

    if (serializedBlock) {
      const block = new Block(Buffer.from(serializedBlock, 'hex'));

      blockData = block.toBuffer();
    }

    const response = new GetBlockResponse();
    response.setBlock(blockData);

    return response;
  }

  return getBlockHandler;
}

module.exports = getBlockHandlerFactory;
