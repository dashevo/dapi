const { MerkleBlock, BloomFilter } = require('@dashevo/dashcore-lib');
const { TransactionsWithProofsResponse } = require('@dashevo/dapi-grpc');

const TransactionHashesCache = require('../../../transactionsFilter/TransactionHashesCache');
const BloomFilterEmitter = require('../../../bloomFilter/emitter/BloomFilterEmitter');

const InvalidArgumentError = require('../../error/InvalidArgumentError');

function subscribeToNewTransactions(
  call,
  filter,
  testTransactionAgainstFilter,
  bloomFilterEmitterCollection,
) {
  const filterEmitter = new BloomFilterEmitter(filter, testTransactionAgainstFilter);

  const matchedTransactionHashes = new TransactionHashesCache();

  // Send a raw transaction or a locked transaction hash when they match the bloom filter
  filterEmitter.on('match', (transaction) => {
    const response = new TransactionsWithProofsResponse();

    // Store the matched transaction hash
    // in order to build a merkle block with sent transactions
    matchedTransactionHashes.add(transaction.hash);

    // Send transaction
    response.setRawTransaction(transaction.toBuffer());

    call.write(response.toObject());
  });

  // Send a merkle block with previously sent transactions when they got mined
  filterEmitter.on('block', (block) => {
    const blockTransactionHashes = block.transactions.map(t => t.hash);

    // Remove transactions from cache if they have enough confirmations
    matchedTransactionHashes.updateByBlockTransactionHashes(blockTransactionHashes);

    // Mark matched transactions in the block
    let hasMatchedTransactions = false;
    const matchedTransactionFlags = blockTransactionHashes.map((hash) => {
      const isMatched = matchedTransactionHashes.getConfirmationsCount(hash) === 1;

      if (isMatched) {
        hasMatchedTransactions = true;
      }

      return isMatched;
    });

    // Do nothing if there are no matched transactions
    if (!hasMatchedTransactions) {
      return;
    }

    const merkleBlock = MerkleBlock.build(
      block.header,
      blockTransactionHashes,
      matchedTransactionFlags,
    );

    const response = new TransactionsWithProofsResponse();
    response.setRawMerkleBlock(merkleBlock.toBuffer());

    call.write(response.toObject());
  });

  // Add the bloom filter emitter to the collection
  bloomFilterEmitterCollection.add(filterEmitter);

  return filterEmitter;
}

async function subscribeToHistoricalTransactions(
  filter,
  fromBlockHash,
  fromBlockHeight,
  count,
  coreAPI,
  callback,
) {
  if (count < 1) {
    const grpcError = new InvalidArgumentError('count should be more than 0');

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

  const merkleBlocks = await coreAPI.getMerkleBlocks(filter, blockHash, count);
}

/**
 *
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @param {testFunction} testTransactionAgainstFilter
 * @param {RpcClient} coreAPI
 * @return {subscribeToTransactionsWithProofsHandler}
 */
function subscribeToTransactionsWithProofsHandlerFactory(
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

    await subscribeToHistoricalTransactions(
      filter.toBuffer().toString('hex'),
      fromBlockHash,
      fromBlockHeight,
      count,
      coreAPI,
      callback,
    );

    const filterEmitter = subscribeToNewTransactions(
      call,
      filter,
      testTransactionAgainstFilter,
      bloomFilterEmitterCollection,
    );

    // Remove the bloom filter emitter from the collection when client disconnects
    call.on('cancelled', () => {
      call.end();

      if (filterEmitter) {
        bloomFilterEmitterCollection.remove(filterEmitter);
      }

      callback(null, null);
    });
  }

  return subscribeToTransactionsWithProofsHandler;
}

module.exports = subscribeToTransactionsWithProofsHandlerFactory;
