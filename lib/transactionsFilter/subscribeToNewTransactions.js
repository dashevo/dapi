const { MerkleBlock } = require('@dashevo/dashcore-lib');

const TransactionHashesCache = require('./TransactionHashesCache');
const BloomFilterEmitter = require('../bloomFilter/emitter/BloomFilterEmitter');

const ProcessMediator = require('../transactionsFilter/ProcessMediator');

/**
 * @typedef subscribeToNewTransactions
 * @param {ProcessMediator} mediator
 * @param {BloomFilter} filter
 * @param {testFunction} testTransactionAgainstFilter
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 */
function subscribeToNewTransactions(
  mediator,
  filter,
  testTransactionAgainstFilter,
  bloomFilterEmitterCollection,
) {
  const filterEmitter = new BloomFilterEmitter(filter, testTransactionAgainstFilter);

  const transactionsAndBlocksCache = new TransactionHashesCache();

  // store and emit transaction or a locked transaction hash when they match the bloom filter
  filterEmitter.on('match', (transaction) => {
    // Store the matched transaction
    // in order to build a merkle block with sent transactions
    transactionsAndBlocksCache.addTransaction(transaction);

    mediator.emit(ProcessMediator.EVENTS.TRANSACTION, transaction);
  });

  // prepare and emit merkle block with previously sent transactions when they got mined
  filterEmitter.on('block', (block) => {
    transactionsAndBlocksCache.addBlock(block);

    const hasMatchedTransactions = transactionsAndBlocksCache.hasMatchedTransactions(block);

    // Do nothing if there are no matched transactions
    if (!hasMatchedTransactions) {
      return;
    }

    const blockTransactionHashes = block.transactions.map(t => t.hash);
    const matchedTransactionFlags = blockTransactionHashes
      .map(hash => transactionsAndBlocksCache.hasTransactionHash(hash));

    const merkleBlock = MerkleBlock.build(
      block.header,
      blockTransactionHashes,
      matchedTransactionFlags,
    );

    mediator.emit(ProcessMediator.EVENTS.MERKLE_BLOCK, merkleBlock);
  });

  mediator.on(ProcessMediator.EVENTS.HISTORICAL_TRANSACTIONS_SENT, (transactions) => {
    // TODO: remove transactions and linked blocks from cache
  });

  mediator.on(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT, () => {
    // TODO: get merkle blocks and transaction to sent from cace
  });

  // Add the bloom filter emitter to the collection
  bloomFilterEmitterCollection.add(filterEmitter);

  mediator.on(ProcessMediator.EVENTS.CLIENT_DISCONNECTED, () => {
    bloomFilterEmitterCollection.remove(filterEmitter);
  });
}

module.exports = subscribeToNewTransactions;
