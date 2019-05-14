const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @return {testTransactionAgainstFilterCollection}
 */
function testTransactionAgainstFilterCollectionFactory(bloomFilterEmitterCollection) {
  async function testTransactionAgainstFilterCollection(rawTransaction) {
    const transaction = new Transaction(rawTransaction);

    bloomFilterEmitterCollection.test(transaction);
  }

  return testTransactionAgainstFilterCollection;
}

module.exports = testTransactionAgainstFilterCollectionFactory;
