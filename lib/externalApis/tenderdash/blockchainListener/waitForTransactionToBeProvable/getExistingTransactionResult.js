const TransactionOkResult = require('./transactionResult/TransactionOkResult');
const TransactionErrorResult = require('./transactionResult/TransactionErrorResult');

/**
 * @param {RpcClient} rpcClient
 * @return {getExistingTransactionResult}
 */
function getExistingTransactionResultFactory(rpcClient) {
  /**
   * @typedef {getExistingTransactionResult}
   * @param {string} hashString
   * @return {Promise<TransactionOkResult|TransactionErrorResult>}
   */
  function getExistingTransactionResult(hashString) {
    return rpcClient.tx({
      tx: `0x${hashString}`,
    }).then((response) => {
      const TransactionResultClass = response.tx_result.code === 0
        ? TransactionOkResult
        : TransactionErrorResult;

      return new TransactionResultClass(
        response.tx_result,
        Buffer.from(response.tx, 'base64'),
      );
    });
  }

  return getExistingTransactionResult;
}

module.exports = getExistingTransactionResultFactory;
