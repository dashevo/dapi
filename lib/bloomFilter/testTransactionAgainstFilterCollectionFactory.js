const { Transaction } = require('@dashevo/dashcore-lib');

function testTransactionAgainstFilterCollectionFactory(getRawTransaction, bloomFilterCollection) {
  async function testTransactionAgainstFilterCollection(transactionHash) {
    const rawTransaction = await getRawTransaction(transactionHash);
    const transaction = new Transaction(rawTransaction);

    bloomFilterCollection.test(transaction);
  }

  return testTransactionAgainstFilterCollection;
}

module.exports = testTransactionAgainstFilterCollectionFactory;
