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
    const blockchainInfo = await coreRPCClient.getBlockchainInfo();
    const networkInfo = await coreRPCClient.getNetworkInfo();

    const response = new GetStatusResponse();

    const version = new GetStatusResponse.Version();
    version.setProtocol(networkInfo.protocolversion);
    version.setSoftware(networkInfo.version);
    version.setAgent(networkInfo.agent);

    const time = new GetStatusResponse.Time();
    time.setNow(Date.now());
    time.setOffset(networkInfo.timeoffset);
    time.setMedium(blockchainInfo.mediantime);

    // TODO: enum not started, syncing, ready (chain.isSynced && masternode.isSynced),
    response.setStatus(true);

    response.setSyncProgress(blockchainInfo.verificationprogress);

    const chain = new GetStatusResponse.Chain();
    chain.setName(blockchainInfo.chain);
    chain.setBlocksCount(blockchainInfo.blocks);
    chain.setHeadersCount(blockchainInfo.headers);
    chain.setBestBlockHash(blockchainInfo.bestblockhash);
    chain.setDifficulty(blockchainInfo.difficulty);
    chain.setChainWork(blockchainInfo.chainwork);

    // TODO: mnsync status.isBlockchainSynced
    chain.setIsSynced(true);
    chain.setSyncProgres(blockchainInfo.verificationprogress);

    const masternode = new GetStatusResponse.Masternode();
    // TODO: mnsync status.state
    masternode.setState('READY');
    // TODO: mnsync status.proTxHash
    masternode.setProTxHash('ABCDEFG');
    // TODO: mnsync status.dmnState.PosePenalty
    masternode.setPosePenalty(1);
    // TODO: mnsync status.isSynced
    masternode.setIsSynced(true);
    // TODO: mnsync status.AssetId to enum
    masternode.setSyncProgress(0.3333333);

    const network = new GetStatusResponse.Network();
    network.setPeersCount(networkInfo.connections);

    const networkFee = new GetStatusResponse.Network.Fee();
    networkFee.setRelay(networkInfo.relayfee);
    networkFee.setIncremental(networkInfo.incrementfee);

    network.setFee(networkFee);

    response.setVersion(version);
    response.setTime(time);
    response.setChain(chain);
    response.setMasternode(masternode);
    response.setNetwork(network);

    return response;
  }

  return getStatusHandler;
}

module.exports = getStatusHandlerFactory;
