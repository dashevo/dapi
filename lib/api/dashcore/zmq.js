const { EventEmitter } = require('events');
const zeromq = require('zeromq');
const { ZMQ_TOPICS } = require('./constants');

class ZmqClient extends EventEmitter {
  constructor(host, port) {
    super();
    this.initSubscriber(host, port);
  }

  start() {
    return new Promise((resolve) => {
      this.subscriber.connect(this.connectionString);
      this.initMessageHandlers();
      this.subscriber.on('connect', (fd, endPoint) => {
        console.info('ZMQ connected to:', endPoint);
        return resolve();
      });
    });
  }

  initSubscriber(host, port) {
    this.connectionString = `tcp://${host}:${port}`;
    this.subscriber = zeromq.socket('sub');
    this.subscriber.on('connect_delay', (fd, endPoint) => {
      console.warn('ZMQ connection delay:', endPoint);
    });

    this.subscriber.on('disconnect', (fd, endPoint) => {
      console.warn('ZMQ disconnect:', endPoint);
    });
  }

  initMessageHandlers() {
    ZMQ_TOPICS.forEach(notification => this.subscriber.subscribe(notification));
    this.subscriber.on('message', this.emit.bind(this));
  }
}

module.exports = ZmqClient;
