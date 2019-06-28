const { MerkleBlock, Transaction } = require('@dashevo/dashcore-lib');
const { MAX_HEADERS_PER_REQUEST } = require('../constants');

/**
 * @param {CoreRpcClient} coreRpcApi
 * @param {string[]} transactionHashes
 * @return {Promise<Transaction[]>}
 */
async function getTransactions(coreRpcApi, transactionHashes) {
  const rawTransactions = await Promise.all(transactionHashes.map(
    transactionHash => coreRpcApi.getRawTransaction(transactionHash),
  ));
  return rawTransactions.map(tx => new Transaction(tx));
}

/**
 * @param {number} batchIndex
 * @param {number} numberOfBatches
 * @param {number} totalCount
 * @return {number}
 */
function getBlocksToScan(batchIndex, numberOfBatches, totalCount) {
  const isLastBatch = batchIndex + 1 === numberOfBatches;
  return isLastBatch
    ? totalCount - batchIndex * MAX_HEADERS_PER_REQUEST
    : MAX_HEADERS_PER_REQUEST;
}

/**
 * @param {CoreRpcClient} coreRpcApi
 * @return {getHistoricalTransactionsIterator}
 */
function getHistoricalTransactionsIteratorFactory(coreRpcApi) {
  /**
   * @typedef getHistoricalTransactionsIterator
   * @param filter
   * @param fromBlockHash
   * @param count
   * @return {AsyncIterableIterator<{merkleBlock: MerkleBlock, transactions: Transaction[]}>}
   */
  async function* getHistoricalTransactionsIterator(
    filter,
    fromBlockHash,
    count,
  ) {
    const fromBlock = await coreRpcApi.getBlock(fromBlockHash);
    const fromHeight = fromBlock.height;
    const numberOfBatches = Math.ceil(count / MAX_HEADERS_PER_REQUEST);

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const currentHeight = fromHeight + batchIndex * MAX_HEADERS_PER_REQUEST;
      const blocksToScan = getBlocksToScan(batchIndex, numberOfBatches, count);

      const blockHash = await coreRpcApi.getBlockHash(currentHeight);
      const rawMerkleBlocks = await coreRpcApi.getMerkleBlocks(filter, blockHash, blocksToScan);

      for (const rawMerkleBlock of rawMerkleBlocks) {
        const merkleBlock = new MerkleBlock(Buffer.from(rawMerkleBlock, 'hex'));
        const transactionHashes = merkleBlock.getMatchedTransactionHashes();
        const transactions = await getTransactions(coreRpcApi, transactionHashes);

        yield { merkleBlock, transactions };
      }
    }
  }

  return getHistoricalTransactionsIterator;
}

module.exports = getHistoricalTransactionsIteratorFactory;