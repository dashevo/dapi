const { MerkleBlock } = require('@dashevo/dashcore-lib');

const { TransactionsWithProofsResponse } = require('@dashevo/dapi-grpc');

const TransactionHashesCache = require('./TransactionHashesCache');
const BloomFilterEmitter = require('../bloomFilter/emitter/BloomFilterEmitter');

const ProcessMediator = require('../transactionsFilter/ProcessMediator');

function subscribeToNewTransactions(
  mediator,
  call,
  filter,
  testTransactionAgainstFilter,
  bloomFilterEmitterCollection,
) {
  const filterEmitter = new BloomFilterEmitter(filter, testTransactionAgainstFilter);

  const transactionsAndBlocksCache = new TransactionHashesCache();

  // Send a raw transaction or a locked transaction hash when they match the bloom filter
  filterEmitter.on('match', (transaction) => {
    // Store the matched transaction
    // in order to build a merkle block with sent transactions
    transactionsAndBlocksCache.addTransaction(transaction);

    // Send transaction
    if (mediator.isLastBatchSent()) {
      filterEmitter.emit('sendTransaction', transaction);
    }
  });

  filterEmitter.on('sendTransaction', (transaction) => {
    const response = new TransactionsWithProofsResponse();

    response.setRawTransactions([transaction.toBuffer()]);

    call.write(response.toObject());
  });

  // Send a merkle block with previously sent transactions when they got mined
  filterEmitter.on('block', (block) => {
    transactionsAndBlocksCache.addBlock(block);

    if (mediator.isLastBatchSent()) {
      filterEmitter.emit('sendBlock', block);
    }
  });

  filterEmitter.on('sendBlock', (block) => {
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

    const response = new TransactionsWithProofsResponse();
    response.setRawMerkleBlock(merkleBlock.toBuffer());

    call.write(response.toObject());
  });

  mediator.on(ProcessMediator.EVENTS.LAST_BATCH_SENT, (blockHashes) => {
    const unsentBlocks = transactionsAndBlocksCache.getUnmatchedBlocks(blockHashes);

    unsentBlocks
      .forEach((block) => {
        const matchedTransactions = transactionsAndBlocksCache.getMatchedTransactions(block);

        matchedTransactions
          .forEach(transaction => filterEmitter.emit('sendTransaction', transaction));

        filterEmitter.emit('sendBlock', block);
      });
  });

  // Add the bloom filter emitter to the collection
  bloomFilterEmitterCollection.add(filterEmitter);

  // Remove the bloom filter emitter from the collection when client disconnects
  call.on('cancelled', () => {
    if (filterEmitter) {
      bloomFilterEmitterCollection.remove(filterEmitter);
    }
  });
}

module.exports = subscribeToNewTransactions;
