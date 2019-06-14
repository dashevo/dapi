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

    // TODO: It might be undefined
    if (count < 1) {
      const grpcError = new InvalidArgumentError('count should be more than 0');

      callback(grpcError, null);

      return;
    }

    // TODO: fromBlockHash + count less then chain size

    const mediator = new ProcessMediator();

    if (!count) {
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

    // Remove the bloom filter emitter from the collection when client disconnects
    call.on('cancelled', () => {
      call.end();

      callback(null, null);
    });
  }

  return subscribeToTransactionsWithProofsHandler;
}

module.exports = subscribeToTransactionsWithProofsHandlerFactory;
