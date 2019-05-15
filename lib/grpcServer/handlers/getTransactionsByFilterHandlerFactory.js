const BloomFilter = require('bloom-filter');
const { MerkleBlock } = require('@dashevo/dashcore-lib');
const { TransactionFilterResponse } = require('@dashevo/dapi-grpc');

const TransactionHashesCache = require('../../transactionsFilter/TransactionHashesCache');
const BloomFilterEmitter = require('../../bloomFilter/emitter/BloomFilterEmitter');

/**
 *
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @param {testFunction} testTransactionAgainstFilter
 * @return {getTransactionsByFilterHandler}
 */
function getTransactionsByFilterHandlerFactory(
  bloomFilterEmitterCollection,
  testTransactionAgainstFilter,
) {
  /**
   * @typedef getTransactionsByFilterHandler
   * @param {Object} call
   */
  function getTransactionsByFilterHandler(call) {
    const matchedTransactionHashes = new TransactionHashesCache();

    // Create a new bloom filter emitter when client connects
    const filter = new BloomFilter(call.request);
    const filterEmitter = new BloomFilterEmitter(filter, testTransactionAgainstFilter);

    // Send a raw transaction or a locked transaction hash when they match the bloom filter
    filterEmitter.on('match', (transaction) => {
      const response = new TransactionFilterResponse();

      // Store the matched transaction hash
      // in order to build a merkle block with sent transactions
      matchedTransactionHashes.add(transaction.hash);

      // Send transaction
      response.setRawTransaction(transaction.toBuffer());

      call.write(response.toObject());
    });

    // Send merkle block with previously sent transactions when they mined
    filterEmitter.on('block', (block) => {
      const blockTransactionHashes = block.getTransactionHashes();

      // Remove transactions from cache if they have enough confirmations
      matchedTransactionHashes.updateByBlockTransactionHashes(blockTransactionHashes);

      const flags = blockTransactionHashes.map(hash => (
        matchedTransactionHashes.getConfirmationsCount(hash) === 1
      ));

      // Build a merkle block
      const merkleBlock = new MerkleBlock({
        header: block.header,
        numTransactions: blockTransactionHashes.length,
        hashes: blockTransactionHashes,
        flags,
      });

      const response = new TransactionFilterResponse();
      response.setRawMerkleBlock(merkleBlock.toBuffer());

      call.write(response.toObject());
    });

    // Add the bloom filter emitter to the collection
    bloomFilterEmitterCollection.add(filterEmitter);

    // Remove the bloom filter emitter from the collection when client disconnects
    call.on('cancelled', () => {
      call.end();

      bloomFilterEmitterCollection.remove(filterEmitter);
    });
  }

  return getTransactionsByFilterHandler;
}

module.exports = getTransactionsByFilterHandlerFactory;
