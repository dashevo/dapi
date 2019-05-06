/**
 * @typedef testTransactionAgainstFilter
 * @param {Filter} filter
 * @param {Transaction} transaction
 */
function testTransactionAgainstFilter(filter, transaction) {
  // TODO: Test inputs and outputs according to BIP37

  return filter.contains(transaction.hash);
}

module.exports = testTransactionAgainstFilter;
