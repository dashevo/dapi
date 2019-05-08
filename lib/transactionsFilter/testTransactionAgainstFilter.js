/**
 * @typedef testTransactionAgainstFilter
 * @param {Filter} filter
 * @param {Transaction} transaction
 */
function testTransactionAgainstFilter(filter, transaction) {
  let contains = false;
  // TODO: Test inputs and outputs according to BIP37
  // According to BIP37, first thing we test the transaction hash itself:
  contains = filter.contains(transaction.hash);
  if (contains) {
    return contains;
  }

  if (Array.isArray(transaction.outputs)) {
    transaction.outputs.findIndex((output) => {
      filter.contains();
    });
  }

  if (contains) {
    return contains;
  }

  if (Array.isArray(transaction.inputs)) {
    transaction.inputs.findIndex((input) => {
      filter.contains();
    });
  }

  return contains;
}

module.exports = testTransactionAgainstFilter;
