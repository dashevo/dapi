const crypto = require('crypto');

const EventEmitter = require('events');
const TransactionWaitPeriodExceededError = require('../../../errors/TransactionWaitPeriodExceededError');
const TransactionErrorResult = require("./transactionResult/TransactionErrorResult");
const TransactionOkResult = require("./transactionResult/TransactionOkResult");

const TX_QUERY = 'tm.event = \'Tx\'';
const NEW_BLOCK_QUERY = 'tm.event = \'NewBlock\'';
const events = {
  NEW_BLOCK: 'block',
};

class BlockchainListener extends EventEmitter {
  /**
   * @param {WsClient} tenderdashWsClient
   */
  constructor(tenderdashWsClient) {
    super();
    this.wsClient = tenderdashWsClient;
  }

  /**
   * Returns an event name for a specific hash
   * @private
   * @param {string} transactionHashString
   * @return {string}
   */
  static getTransactionEventName(transactionHashString) {
    return `transaction:${transactionHashString}`;
  }

  /**
   *
   * @param transactionHashString
   * @return {string}
   */
  static getTransactionAddedToTheBlockEventName(transactionHashString) {
    return `blockTransactionAdded:${transactionHashString}`;
  }

  /**
   * Subscribe to blocks and transaction results
   */
  start() {
    // Emit transaction results
    this.wsClient.subscribe(TX_QUERY);
    this.wsClient.on(TX_QUERY, (message) => {
      const hashArray = message && message.events ? message.events['tx.hash'] : null;
      const hashString = Array.isArray(hashArray) && hashArray[0];
      if (!hashString) {
        return;
      }

      this.emit(BlockchainListener.getTransactionEventName(hashString), message);
    });

    // Emit blocks and contained transactions
    this.wsClient.subscribe(NEW_BLOCK_QUERY);
    this.wsClient.on(NEW_BLOCK_QUERY, (message) => {
      this.emit(events.NEW_BLOCK, message);

      // Emit transaction hashes from block
      message.data.value.block.data.txs.forEach((base64tx) => {
        const transaction = Buffer.from(base64tx, 'base64');
        const hashString = crypto.createHash('sha256')
          .update(transaction)
          .digest()
          .toString('hex');

        this.emit(
          BlockchainListener.getTransactionAddedToTheBlockEventName(hashString),
          transaction,
        );
      });
    });
  }

  /**
   * Returns data for a transaction or rejects after a timeout
   * @param {string} hashString - transaction hash to resolve data for
   * @param {number} [timeout] - timeout to reject after
   * @return {Promise<Object>}
   */
  waitForTransactionToBeProvable(hashString, timeout = 60000) {
    const topic = BlockchainListener.getTransactionEventName(hashString);
    const txInBlockTopic = BlockchainListener
      .getTransactionAddedToTheBlockEventName(hashString.toLowerCase());


    // Wait for transaction result
    let txHandler;
    const txPromise = new Promise((resolve, reject) => {
      txHandler = (data) => {
        this.off(topic, txHandler);

        const { result } = data.data.value.TxResult;

        if (result && result.code !== undefined && result.code !== 0) {
          // If a transaction result is error we don't need to wait for next block
          return reject(
            new TransactionErrorResult(result),
          );
        }

        return resolve(
          new TransactionOkResult(result),
        );
      };

      this.on(topic, txHandler);
    });

    // Wait for transaction is committed to a block and proofs are available
    let txInBlockHandler;
    let newBlockHandler;
    const txInBlockPromise = new Promise(((resolve) => {
      let seenTransaction = false;
      txInBlockHandler = () => {
        seenTransaction = true;
      };
      newBlockHandler = () => {
        if (seenTransaction) {
          // Note that this will resolve only after two blocks. That is because the first block will
          // flip the 'seenTransaction' toggle to true, and transaction will become provable
          // only on the next block after the block it was included into
          this.off(events.NEW_BLOCK, newBlockHandler);
          resolve();
        }
      };

      this.once(txInBlockTopic, txInBlockHandler);
      this.on(events.NEW_BLOCK, newBlockHandler);
    }));

    return Promise.race([
      // Wait for transaction results and commitment
      Promise.all([
        txPromise,
        txInBlockPromise,
      ]).then(([transactionResult]) => transactionResult)
        .catch((e) => {
          // Stop waiting for next block and return transaction error result
          if (e instanceof TransactionErrorResult) {
            return Promise.resolve(e);
          }

          return Promise.reject(e);
        }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          // Detaching old handlers
          this.off(topic, txHandler);
          this.off(txInBlockTopic, txInBlockHandler);
          this.off(events.NEW_BLOCK, newBlockHandler);
          reject(new TransactionWaitPeriodExceededError(hashString));
        }, timeout);
      }),
    ]);
  }
}

BlockchainListener.TX_QUERY = TX_QUERY;
BlockchainListener.NEW_BLOCK_QUERY = NEW_BLOCK_QUERY;
BlockchainListener.events = events;

module.exports = BlockchainListener;
