const { Transaction } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterCollection} bloomFilterCollection
 * @param {{getRawTransaction: function(string): Promise<Object>}} dashCoreRpcClient
 * @return {testTransactionAgainstFilterCollection}
 */
function testTransactionAgainstFilterCollectionFactory(bloomFilterCollection, dashCoreRpcClient) {
  async function testTransactionAgainstFilterCollection(transactionHash) {
    // TODO Cache transactions in case of hashtxlock event
    const rawTransaction = await dashCoreRpcClient.getRawTransaction(transactionHash);
    const transaction = new Transaction(rawTransaction);

    bloomFilterCollection.test(transaction);
  }

  return testTransactionAgainstFilterCollection;
}

module.exports = testTransactionAgainstFilterCollectionFactory;
