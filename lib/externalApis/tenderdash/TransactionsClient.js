const EventEmitter = require('events');
const TransactionWaitPeriodExceededError = require('../../errors/TransactionWaitPeriodExceededError');

const TX_QUERY = 'tm.event = \'Tx\'';

class TransactionsClient extends EventEmitter {
  /**
   * @param {WsClient} tenderdashWsClient
   */
  constructor(tenderdashWsClient) {
    super();
    this.wsClient = tenderdashWsClient;
    this.wsClient.subscribe(TX_QUERY);
    this.wsClient.on(TX_QUERY, (message) => {
      this.emitTransaction(message);
    });
  }

  /**
   * Returns an event name for a specific hash
   * @param {string} transactionHashString
   * @return {string}
   */
  static getTransactionEventName(transactionHashString) {
    return `transaction:${transactionHashString}`;
  }

  /**
   * Creates promisified event handler
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

  /**
   * Emits transaction:%tx_hash% if there's a transaction in the message
   * @param {Object} message
   */
  emitTransaction(message) {
    const hashString = message && message.events ? message.events['tx.hash'] : null;
    if (!hashString) {
      return;
    }

    this.emit(TransactionsClient.getTransactionEventName(hashString), message);
  }

  /**
   * Returns data for a transaction or rejects after a timeout
   * @param {string} hashString - transaction hash to resolve data for
   * @param {number} [timeout] - timeout to reject after
   * @return {Promise<Object>}
   */
  waitForTransaction(hashString, timeout = 60000) {
    const topic = TransactionsClient.getTransactionEventName(hashString);
    let handler;

    return Promise.race([
      new Promise((resolve) => {
        handler = this.createPromiseHandler(topic, resolve);
        this.on(topic, handler);
      }),
      new Promise((resolve, reject) => {
        setTimeout(() => {
          this.off(topic, handler);
          reject(new TransactionWaitPeriodExceededError(hashString));
        }, timeout);
      }),
    ]);
  }
}

TransactionsClient.TX_QUERY = TX_QUERY;

module.exports = TransactionsClient;
