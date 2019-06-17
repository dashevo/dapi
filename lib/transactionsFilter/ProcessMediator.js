const { EventEmitter } = require('events');

const lastBatchSentPropertyName = Symbol('lastBatchSent');

class ProcessMediator extends EventEmitter {
  constructor() {
    super();

    this[lastBatchSentPropertyName] = false;
  }

  /**
   * Get flag indicating that last batch was sent
   *
   * @returns {boolean}
   */
  isLastBatchSent() {
    return this[lastBatchSentPropertyName];
  }

  /**
   * Fire an event indicating that last batch was sent
   *
   * @param {string[]} blockHashes
   */
  lastBatchSent(blockHashes) {
    this[lastBatchSentPropertyName] = true;

    this.emitSerial(ProcessMediator.EVENTS.LAST_BATCH_SENT, blockHashes);
  }
}

ProcessMediator.EVENTS = {
  LAST_BATCH_SENT: 'lastBatchSent',
};

module.exports = ProcessMediator;
