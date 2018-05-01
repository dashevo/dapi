const { PrivateKey, Message } = require('@dashevo/dashcore-lib');
const mocks = require('../../mocks/mocks');
const logger = require('../../log');
const mempoolBase = require('./mempoolBase');

const isMnMessage = (signature, pubAdr, message) =>
  mocks.mnList.find(mn => mn.publicAdr === pubAdr) &&
    Message(message).verify(pubAdr, signature);

class KeyValueStore extends mempoolBase {
  constructor(port, namespace = 'dapinet') {
    super(port);
    this.kvs = this.orbitdb.kvstore(namespace);
    this.init();
  }

  init(key = 'message') {
    this.kvs.events.on('ready', () => {
      logger.debug(`ready: ${this.kvs.get(key)}`);
    });

    this.kvs.events.on('synced', () => {
      logger.debug(`synced: ${this.kvs.get(key)}`);
    });

    this.kvs.events.on('write', (dbname, hash, entry) => {
      const obj = entry.payload.value;
      if (isMnMessage(obj.signature, obj.publicAdr, obj.value)) {
        /* eslint no-underscore-dangle: 0 */
        this.kvs._ipfs.pin.add(hash);
        /* eslint-enable no-underscore-dangle */

        // some analysis still needed here
        // pinning might not be needed as recently added data will be available long enough?
        // what about spam attacks with limited mempool size where we might want pinning
        // so that valid data does not get dropped?
      } else {
        logger.debug(`Message ${hash} not from valid MN, not pinning...`);
      }
    });
  }

  writeValue(privKey, pubAdr, value, key = 'dapi_default_key') {
    const message = {
      signature: Message(value.toString()).sign(new PrivateKey(privKey)),
      publicAdr: pubAdr,
      value: value.toString(),
    };

    this.kvs.set(key, message)
      .then(() => {
        logger.debug(this.kvs.get(key));
      });
  }

  getValue(key = 'message') {
    const d = this.kvs.get(key);

    if (d && isMnMessage(d.signature, d.publicAdr, d.value)) {
      return d;
    }

    return false;
  }

  contains(key) {
    return this.kvs.get(key) !== 'undefined';
  }
}

module.exports = KeyValueStore;
