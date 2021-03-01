const {
  v0: {
    GetStatusResponse,
  },
} = require('@dashevo/dapi-grpc');

/**
 * @param {CoreRpcClient} coreRPCClient
 * @returns {getStatusHandler}
 */
function getStatusHandlerFactory(coreRPCClient) {
  /**
   * @typedef getStatusHandler
   * @return {Promise<GetStatusResponse>}
   */
  async function getStatusHandler() {
    const { info } = await coreRPCClient.getStatus('getInfo');

    const {
      bestBlockHash,
      blocks,
      chain,
      difficulty,
      version,
      protocolversion,
      blocks,
      connections,
      relayfee,
      warnings,
    } = info;


    const response = new GetStatusResponse();
    response.setCoreVersion(version);
    response.setProtocolVersion(protocolVersion);
    response.setSubVersion(subVersion);
    response.setBlocks(blocks);
    response.setBestBlockHash(bestBlockHash);
    response.setTimeOffset(timeoffset);
    response.setConnections(connections);
    response.setDifficulty(difficulty);
    response.setRelayFee(relayfee);
    response.setWarnings(warnings);
    response.setChain(chain);

    return response;
  }

  return getStatusHandler;
}

module.exports = getStatusHandlerFactory;
