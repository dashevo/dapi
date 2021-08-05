const RPCError = require('../../rpcServer/RPCError');

/**
 * @param {RpcClient} rpcClient
 * @return {getConsensusParams}
 */
function getConsensusParamsFactory(rpcClient) {
  /**
   * @typedef getConsensusParams
   * @returns {Promise<{
   * block: {
   *   max_bytes: string,
   *   max_gas: string,
   *   time_iota_ms: string
   *  },
   *  evidence: {
   *    max_age: string,
   *  }
   *  }>}
   */
  async function getConsensusParams() {
    const { result, error } = await rpcClient.request('consensus_params');

    // Handle JSON RPC error
    if (error) {
      throw new RPCError(
        error.code || -32602,
        error.message || 'Internal error',
        error.data,
      );
    }

    return {
      block: result.block,
      evidence: result.evidence,
    };
  }

  return getConsensusParams;
}

module.exports = getConsensusParamsFactory;
