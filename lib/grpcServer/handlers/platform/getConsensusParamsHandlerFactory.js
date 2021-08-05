const InvalidArgumentGrpcError = require('@dashevo/grpc-common/lib/server/error/InvalidArgumentGrpcError');

const {
  server: {
    error: {
      InternalGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    GetConsensusParamsResponse,
    ConsensusParamsBlock,
    ConsensusParamsEvidence,
  },
} = require('@dashevo/dapi-grpc');

const RPCError = require('../../../rpcServer/RPCError');

/**
 *
 * @param {getConsensusParams} getConsensusParams
 * @returns {getConsensusParamsHandler}
 */
function getConsensusParamsHandlerFactory(getConsensusParams) {
  /**
   * @typedef getConsensusParamsHandler
   * @param {Object} call
   * @returns {Promise<>}
   */
  async function getConsensusParamsHandler(call) {
    const { request } = call;

    const prove = request.getProve();

    if (prove) {
      throw new InvalidArgumentGrpcError('prove is not implemented yet');
    }

    let consensusParams;

    try {
      consensusParams = await getConsensusParams();
    } catch (e) {
      if (e instanceof RPCError) {
        throw new InternalGrpcError(e);
      }

      throw e;
    }

    const response = new GetConsensusParamsResponse();

    const block = new ConsensusParamsBlock();
    block.setMaxBytes(consensusParams.block.max_bytes);
    block.setMaxGas(consensusParams.block.max_gas);
    block.setTimeIotaMs(consensusParams.block.time_iota_ms);

    response.setBlock(block);

    const evidence = new ConsensusParamsEvidence();
    evidence.setMaxAge(consensusParams.evidence.max_age);

    response.setEvidence(evidence);

    return response;
  }

  return getConsensusParamsHandler;
}

module.exports = getConsensusParamsHandlerFactory;
