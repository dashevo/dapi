const { MerkleBlock } = require('@dashevo/dashcore-lib');

const { TransactionsWithProofsResponse } = require('@dashevo/dapi-grpc');

const TransactionHashesCache = require('./TransactionHashesCache');
const BloomFilterEmitter = require('../bloomFilter/emitter/BloomFilterEmitter');

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

  // Remove the bloom filter emitter from the collection when client disconnects
  call.on('cancelled', () => {
    if (filterEmitter) {
      bloomFilterEmitterCollection.remove(filterEmitter);
    }
  });
}

module.exports = subscribeToNewTransactions;
