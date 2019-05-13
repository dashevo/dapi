const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterCollection} bloomFilterCollection
 * @return {testTransactionAgainstFilterCollection}
 */
function testTransactionAgainstFilterCollectionFactory(bloomFilterCollection) {
  async function testTransactionAgainstFilterCollection(rawTransaction) {
    const transaction = new Transaction(rawTransaction);

    bloomFilterCollection.test(transaction);
  }

  return testTransactionAgainstFilterCollection;
}

module.exports = testTransactionAgainstFilterCollectionFactory;
