const {
  GetBlockResponse,
} = require('@dashevo/dapi-grpc');

const { Block } = require('@dashevo/dashcore-lib');

const {
  server: {
    error: {
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

    let serializedBlock;
    let blockData;

    try {
      if (hash) {
        serializedBlock = await insightAPI.getRawBlockByHash(hash);
      } else {
        serializedBlock = await insightAPI.getRawBlockByHeight(height);
      }
    } catch (e) {
      blockData = Buffer.alloc(0);
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
