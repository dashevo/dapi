const crypto = require('crypto');

const EventEmitter = require('events');
const TransactionWaitPeriodExceededError = require('../../errors/TransactionWaitPeriodExceededError');

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
   * Subscribe to transactions and attach transaction event handler
   */
  start() {
    this.wsClient.subscribe(TX_QUERY);
    this.wsClient.on(TX_QUERY, this.emitTransaction.bind(this));

    this.wsClient.subscribe(NEW_BLOCK_QUERY);
    this.wsClient.on(NEW_BLOCK_QUERY, (message) => {
      this.emit(events.NEW_BLOCK, message);
      this.emitTransactionHashesInBlock(message.data.value.block.data.txs);
    });
  }

  /**
   * Creates promisified event handler
   * @private
   * @param {string} eventName
   * @param {function} resolve
   * @return {function}
   */
  createPromiseHandler(eventName, resolve) {
    const handler = (data) => {
      this.off(eventName, handler);
      resolve(data);
    };

    return handler;
  }

  emitTransactionHashesInBlock(serializedTransactions) {
    serializedTransactions.forEach((base64tx) => {
      const hashString = crypto.createHash('sha256')
        .update(Buffer.from(base64tx, 'base64'))
        .digest()
        .toString('hex');
      this.emit(BlockchainListener.getTransactionAddedToTheBlockEventName(hashString));
    });
  }

  /**
   * Emits transaction:%tx_hash% if there's a transaction in the message
   * @private
   * @param {Object} message
   */
  emitTransaction(message) {
    const hashArray = message && message.events ? message.events['tx.hash'] : null;
    const hashString = Array.isArray(hashArray) && hashArray[0];
    if (!hashString) {
      return;
    }

    this.emit(BlockchainListener.getTransactionEventName(hashString), message);
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


    let txHandler;
    const txPromise = new Promise(((resolve) => {
      txHandler = this.createPromiseHandler(topic, resolve);
      this.on(topic, txHandler);
    }));

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
      new Promise(async (resolve) => {
        const [data] = await Promise.all([
          txPromise,
          txInBlockPromise,
        ]);
        resolve(data);
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
