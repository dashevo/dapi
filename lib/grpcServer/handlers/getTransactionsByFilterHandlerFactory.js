const BloomFilter = require('bloom-filter');
const { RawTransaction, TransactionFilterResponse, RawMerkleBlock } = require('@dashevo/dapi-grpc');

const BloomFilterEmitter = require('../../bloomFilter/BloomFilterEmitter');

/**
 *
 * @param {BloomFilterCollection} bloomFilterCollection
 * @param {testTransactionAgainstFilter} testTransactionAgainstFilter
 * @return {getTransactionsByFilterHandler}
 */
function getTransactionsByFilterHandlerFactory(
  bloomFilterCollection,
  testTransactionAgainstFilter,
) {
  function getTransactionsByFilterHandler(call) {
    const filter = new BloomFilter(call.request);

    const filterEmitter = new BloomFilterEmitter(filter, testTransactionAgainstFilter);

    filterEmitter.on('match', (transaction) => {
      const rawTransaction = new RawTransaction();

      rawTransaction.setIsInstantSend(transaction.instantlock);
      rawTransaction.setData(transaction.serialize());

      const response = new TransactionFilterResponse();
      response.setTransaction(rawTransaction);

      call.write(response.toObject());
    });

    filterEmitter.on('block', (merkleBlock) => {
      const rawMerkleBlock = new RawMerkleBlock();
      rawMerkleBlock.setData(merkleBlock.serialize());

      const response = new TransactionFilterResponse();
      response.setMerkleBlock(rawMerkleBlock);

      call.write(response.toObject());
    });

    bloomFilterCollection.add(filterEmitter);

    call.on('cancelled', () => {
      call.end();

      bloomFilterCollection.remove(filterEmitter);
    });
  }

  return getTransactionsByFilterHandler;
}

module.exports = getTransactionsByFilterHandlerFactory;
