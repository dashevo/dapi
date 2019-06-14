const { EventEmitter } = require('events');

const lastBatchSentPropertyName = Symbol('lastBatchSent');

class ProcessMediator extends EventEmitter {
  constructor() {
    super();

    this[lastBatchSentPropertyName] = false;
  }

  isLastBatchSent() {
    return this[lastBatchSentPropertyName];
  }

  lastBatchSent() {
    this[lastBatchSentPropertyName] = true;

    this.emitSerial(ProcessMediator.EVENTS.LAST_BATCH_SENT);
  }
}

ProcessMediator.EVENTS = {
  LAST_BATCH_SENT: 'lastBatchSent',
};

module.exports = ProcessMediator;
