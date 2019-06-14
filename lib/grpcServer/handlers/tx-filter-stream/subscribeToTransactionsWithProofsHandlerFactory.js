const { BloomFilter } = require('@dashevo/dashcore-lib');

const ProcessMediator = require('../../../transactionsFilter/ProcessMediator');

const InvalidArgumentError = require('../../error/InvalidArgumentError');

/**
 *
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @param {testFunction} testTransactionAgainstFilter
 * @param {RpcClient} coreAPI
 * @return {subscribeToTransactionsWithProofsHandler}
 */
function subscribeToTransactionsWithProofsHandlerFactory(
  fetchHistoricalTransactions,
  subscribeToNewTransactions,
  bloomFilterEmitterCollection,
  testTransactionAgainstFilter,
  coreAPI,
) {
  /**
   * @typedef subscribeToTransactionsWithProofsHandler
   * @param {Object} call
   * @param {function(Error, Object)} callback
   */
  async function subscribeToTransactionsWithProofsHandler(call, callback) {
    const {
      bloomFilter,
      fromBlockHash,
      fromBlockHeight,
      count,
      sendTransactionHashes,
    } = call.request;

    // Create a new bloom filter emitter when client connects
    let filter;
    try {
      filter = new BloomFilter(bloomFilter);
    } catch (e) {
      const grpcError = new InvalidArgumentError(`Invalid bloom filter: ${e.message}`);

      callback(grpcError, null);

      return;
    }

    let blockHash = fromBlockHash;
    if (fromBlockHeight) {
      const bestHeight = await coreAPI.getBestBlockHeight();

      if (fromBlockHeight > bestHeight) {
        const grpcError = new InvalidArgumentError('fromBlockHeight is bigger than block count');

        callback(grpcError, null);

        return;
      }

      blockHash = await coreAPI.getBlockHash(fromBlockHeight);
    }

    if (count > 0) {
      const block = await coreAPI.getBlock(blockHash);
      const bestBlockHeight = await coreAPI.getBestBlockHeight();

      if (block.height + count > bestBlockHeight) {
        const grpcError = new InvalidArgumentError(
          'count is too big, could not fetch more than blockchain length',
        );

        callback(grpcError, null);

        return;
      }
    }

    const mediator = new ProcessMediator();

    if (count === 0) {
      subscribeToNewTransactions(
        mediator,
        call,
        filter,
        testTransactionAgainstFilter,
        bloomFilterEmitterCollection,
      );
    }

    await fetchHistoricalTransactions(
      mediator,
      call,
      filter,
      blockHash,
      count,
      coreAPI,
      callback,
    );

    // handle case when client disconnected
    call.on('cancelled', () => {
      call.end();

      callback(null, null);
    });
  }

  return subscribeToTransactionsWithProofsHandler;
}

module.exports = subscribeToTransactionsWithProofsHandlerFactory;
