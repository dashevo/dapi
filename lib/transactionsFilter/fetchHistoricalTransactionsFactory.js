const { MerkleBlock } = require('@dashevo/dashcore-lib');
const { MAX_HEADERS_PER_REQUEST } = require('../constants');

/**
 * @param {CoreRpcClient} coreRpcApi
 * @return {fetchHistoricalTransactions}
 */
function fetchHistoricalTransactionsFactory(coreRpcApi) {
  /**
   * @param mediator
   * @param filter
   * @param fromBlockHash
   * @param count
   * @return {AsyncIterableIterator<{merkleBlock: MerkleBlock, rawTransactions: string[]}>}
   */
  async function* fetchHistoricalTransactions(
    mediator,
    filter,
    fromBlockHash,
    count,
  ) {
    const fromBlock = await coreRpcApi.getBlock(fromBlockHash);
    const fromHeight = fromBlock.height;
    const numberOfBatches = Math.ceil(count / MAX_HEADERS_PER_REQUEST);
    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const isLastBatch = batchIndex + 1 === numberOfBatches;
      const currentHeight = fromHeight + batchIndex * MAX_HEADERS_PER_REQUEST;
      const blocksToScan = isLastBatch ? count - batchIndex * MAX_HEADERS_PER_REQUEST : MAX_HEADERS_PER_REQUEST;
      const blockHash = await coreRpcApi.getBlockHash(currentHeight);
      const rawMerkleBlocks = await coreRpcApi.getMerkleBlocks(filter, blockHash, blocksToScan);

      for (const rawMerkleBlock of rawMerkleBlocks) {
        const merkleBlock = new MerkleBlock(Buffer.from(rawMerkleBlock, 'hex'));
        const transactionHashes = merkleBlock.getMatchedTransactionHashes();
        const rawTransactions = await Promise.all(transactionHashes.map(
          transactionHash => coreRpcApi.getRawTransaction(transactionHash),
        ));
        yield { merkleBlock, rawTransactions };
      }
    }
  }

  return fetchHistoricalTransactions;
}

module.exports = fetchHistoricalTransactionsFactory;
