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
    const mnSyncStatus = await coreRPCClient.getMnSync('status');
    const masternodeStatus = await coreRPCClient.getMasternode('status');

    const response = new GetStatusResponse();

    const version = new GetStatusResponse.Version();
    version.setProtocol(networkInfo.protocolversion);
    version.setSoftware(networkInfo.version);
    version.setAgent(networkInfo.subversion);

    const time = new GetStatusResponse.Time();
    time.setNow(Date.now());
    time.setOffset(networkInfo.timeoffset);
    time.setMedian(blockchainInfo.mediantime);

    const chain = new GetStatusResponse.Chain();
    chain.setName(blockchainInfo.chain);
    chain.setBlocksCount(blockchainInfo.blocks);
    chain.setHeadersCount(blockchainInfo.headers);
    chain.setBestBlockHash(blockchainInfo.bestblockhash);
    chain.setDifficulty(blockchainInfo.difficulty);
    chain.setChainWork(blockchainInfo.chainwork);
    chain.setIsSynced(mnSyncStatus.IsBlockchainSynced);
    chain.setSyncProgress(blockchainInfo.verificationprogress);

    const masternode = new GetStatusResponse.Masternode();
    masternode.setStatus(masternodeStatus.status);
    masternode.setProTxHash(masternodeStatus.proTxHash);
    masternode.setPosePenalty(masternodeStatus.dmnState.PoSePenalty);
    masternode.setIsSynced(mnSyncStatus.IsSynced);

    let syncProgress;
    switch (mnSyncStatus.AssetID) {
      case 999:
        syncProgress = 1;
        break;
      case 0:
        syncProgress = 0;
        break;
      case 1:
        syncProgress = 1 / 3;
        break;
      case 4:
        syncProgress = 2 / 3;
        break;
      default:
        syncProgress = 0;
    }
    masternode.setSyncProgress(syncProgress);

    const network = new GetStatusResponse.Network();
    network.setPeersCount(networkInfo.connections);

    const networkFee = new GetStatusResponse.Network.Fee();
    networkFee.setRelay(networkInfo.relayfee);
    networkFee.setIncremental(networkInfo.incrementfee);

    network.setFee(networkFee);

    response.setVersion(version);
    response.setTime(time);
    response.setSyncProgress(blockchainInfo.verificationprogress);
    response.setChain(chain);
    response.setMasternode(masternode);
    response.setNetwork(network);

    let status = 'NOT_STARTED';
    if (mnSyncStatus.IsBlockchainSynced && mnSyncStatus.IsSynced) {
      status = 'READY';
    } else if (blockchainInfo.verificationprogress > 0) {
      status = 'SYNCING';
    }

    response.setStatus(status);

    return response;
  }

  return getStatusHandler;
}

module.exports = getStatusHandlerFactory;
