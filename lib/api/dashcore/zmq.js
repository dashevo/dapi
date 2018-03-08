const { EventEmitter } = require('events');
const zeromq = require('zeromq');
const { ZMQ_TOPICS } = require('./constants');

class ZmqClient extends EventEmitter {
  constructor(host, port) {
    super();
    this.connectionString = `tcp://${host}:${port}`;
  }

  start() {
    this.initSubscriber();
    this.initMessageHandlers();
    return new Promise((resolve) => {
      this.subscriber.connect(this.connectionString);
      this.subscriber.on('connect', (fd, endPoint) => {
        console.info('ZMQ connected to:', endPoint);
        return resolve();
      });
    });
  }

  initSubscriber() {
    this.subscriber = zeromq.socket('sub');
    this.subscriber.on('connect_delay', (fd, endPoint) => {
      console.warn('ZMQ connection delay:', endPoint);
    });

    this.subscriber.on('disconnect', (fd, endPoint) => {
      console.warn('ZMQ disconnect:', endPoint);
    });
  }

  initMessageHandlers() {
    Object.keys(ZMQ_TOPICS).forEach(key => this.subscriber.subscribe(ZMQ_TOPICS[key]));
    this.subscriber.on('message', this.emit.bind(this));
  }
}

module.exports = ZmqClient;
