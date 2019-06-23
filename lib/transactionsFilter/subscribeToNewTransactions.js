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

    // TODO: await lock if any (maybe?)

    const added = transactionsAndBlocksCache.addTransaction(transaction);

    // if transaction have not been added before send it
    if (added) {
      mediator.emit(ProcessMediator.EVENTS.TRANSACTION, transaction);
    }
  });

  // prepare and emit merkle block with previously sent transactions when they got mined
  filterEmitter.on('block', (block) => {
    // TODO: await lock if any (maybe?)

    // in case we've missed some or all transactions and got a block
    if (transactionsAndBlocksCache.getBlockCount() === 0) {
      // test transactions and emit `match` events
      block.transactions.forEach(filterEmitter.test);
    }

    // Check if block have some of matched transactions end cache/send merkle block
    const hasMatchedTransactions = transactionsAndBlocksCache.hasMatchedTransactions(block);

    if (hasMatchedTransactions) {
      const blockTransactionHashes = block.transactions.map(t => t.hash);

      const matchedTransactionFlags = blockTransactionHashes
        .map(hash => transactionsAndBlocksCache.hasTransactionHash(hash));

      const merkleBlock = MerkleBlock.build(
        block.header,
        blockTransactionHashes,
        matchedTransactionFlags,
      );

      transactionsAndBlocksCache.addMerkleBlock(merkleBlock);

      mediator.emit(ProcessMediator.EVENTS.MERKLE_BLOCK, merkleBlock);
    }

    // put block in the cache executing queue logic
    transactionsAndBlocksCache.addBlock(block);
  });

  mediator.on(ProcessMediator.EVENTS.HISTORICAL_BLOCK_SENT, (blockHash) => {
    transactionsAndBlocksCache.removeDataByBlockHash(blockHash);
  });

  mediator.on(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT, () => {
    // TODO: lock writes maybe?

    for (
      const { transactions, merkleBlock } of transactionsAndBlocksCache.getDataGroupedByBlock()
    ) {
      transactions.forEach(tx => mediator.emit(ProcessMediator.EVENTS.TRANSACTION, tx));
      mediator.emit(ProcessMediator.EVENTS.MERKLE_BLOCK, merkleBlock);
    }
  });

  // Add the bloom filter emitter to the collection
  bloomFilterEmitterCollection.add(filterEmitter);

  mediator.on(ProcessMediator.EVENTS.CLIENT_DISCONNECTED, () => {
    bloomFilterEmitterCollection.remove(filterEmitter);
  });
}

module.exports = subscribeToNewTransactions;
