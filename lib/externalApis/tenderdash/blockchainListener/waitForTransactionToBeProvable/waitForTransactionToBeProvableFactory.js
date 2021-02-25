const TransactionWaitPeriodExceededError = require('../../../../errors/TransactionWaitPeriodExceededError');
const TransactionErrorResult = require('./transactionResult/TransactionErrorResult');

/**
 * @param {waitForTransactionResult} waitForTransactionResult
 * @param {waitForTransactionCommitment} waitForTransactionCommitment
 * @param {getExistingTransactionResult} getExistingTransactionResult
 * @return {waitForTransactionToBeProvable}
 */
function waitForTransactionToBeProvableFactory(
  waitForTransactionResult,
  waitForTransactionCommitment,
  getExistingTransactionResult,
) {
  /**
   * Returns result for a transaction or rejects after a timeout
   *
   * @typedef {waitForTransactionToBeProvable}
   * @param {BlockchainListener} blockchainListener
   * @param {string} hashString - transaction hash to resolve data for
   * @param {number} [timeout] - timeout to reject after
   * @return {Promise<TransactionOkResult|TransactionErrorResult>}
   */
  function waitForTransactionToBeProvable(blockchainListener, hashString, timeout = 60000) {
    // Try to fetch existing tx result or wait until they arrive
    const {
      promise: waitForTransactionResultPromise,
      detach: detachTransactionResult,
    } = waitForTransactionResult(blockchainListener, hashString);

    const existingTransactionResultPromise = getExistingTransactionResult(hashString);

    const transactionResultPromise = Promise.race([
      existingTransactionResultPromise.then((result) => {
        // Do not wait for upcoming result if existing is present
        detachTransactionResult();

        return result;
      }).catch((error) => {
        // Do not resolve promise and wait for results if transaction is not found
        if (error.code === -32603 && error.data === `tx (${hashString}) not found`) {
          return new Promise(() => {});
        }

        return Promise.reject(error);
      }),

      waitForTransactionResultPromise,
    ]);

    // Wait for transaction is committed to a block and proofs are available
    const {
      promise: transactionCommitmentPromise,
      detach: detachTransactionCommitment,
    } = waitForTransactionCommitment(blockchainListener, hashString);

    return Promise.race([

      // Wait for transaction results and commitment

      Promise.all([
        transactionResultPromise.then((result) => {
          // If a transaction result is error we don't need to wait for next block
          if (result instanceof TransactionErrorResult) {
            detachTransactionCommitment();

            return Promise.reject(result);
          }

          return result;
        }),
        transactionCommitmentPromise,
      ]).then(([transactionResult]) => transactionResult)
        .catch((e) => {
          // Stop waiting for next block and return transaction error result
          if (e instanceof TransactionErrorResult) {
            return Promise.resolve(e);
          }

          return Promise.reject(e);
        }),

      // Throw wait period exceeded error after timeout

      new Promise((resolve, reject) => {
        setTimeout(() => {
          // Detaching handlers
          detachTransactionResult();
          detachTransactionCommitment();

          reject(new TransactionWaitPeriodExceededError(hashString));
        }, timeout);
      }),
    ]);
  }

  return waitForTransactionToBeProvable;
}

module.exports = waitForTransactionToBeProvableFactory;
