const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterCollection} bloomFilterCollection
 * @param {function(string): Promise<Object>} getRawTransaction
 * @return {testTransactionAgainstFilterCollection}
 */
function testTransactionAgainstFilterCollectionFactory(bloomFilterCollection, getRawTransaction) {
  async function testTransactionAgainstFilterCollection(transactionHash) {
    const rawTransaction = await getRawTransaction(transactionHash);
    const transaction = new Transaction(rawTransaction);

    bloomFilterCollection.test(transaction);
  }

  return testTransactionAgainstFilterCollection;
}

module.exports = testTransactionAgainstFilterCollectionFactory;
