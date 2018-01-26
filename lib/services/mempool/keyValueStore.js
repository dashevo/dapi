// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const { PrivateKey, Message } = require('bitcore-lib-dash').PrivateKey;
const mocks = require('../../mocks/mocks');

class KeyValueStore extends require('./mempoolBase') {
  constructor(port, namespace = 'dapinet') {
    super(port);
    this.kvs = this.orbitdb.kvstore(namespace);
    this.init();
  }

  init(key = 'message') {
    this.kvs.events.on('ready', () => {
      console.log(`ready: ${this.kvs.get(key)}`);
    });

    this.kvs.events.on('synced', () => {
      console.log(`synced: ${this.kvs.get(key)}`);
    });

    this.kvs.events.on('write', (dbname, hash, entry) => {
      const obj = entry.payload.value;
      if (this.isMnMessage(obj.signature, obj.publicAdr, obj.value)) {
        this.kvs._ipfs.pin.add(hash);
        // some analysis still needed here
        // pinning might not be needed as recently added data will be available long enough?
        // what about spam attacks with limited mempool size where we might want pinning so that valid data does not get dropped?
      } else {
        console.log(`Message ${hash} not from valid MN, not pinning...`);
      }
    });
  }

  isMnMessage(signature, pubAdr, message) {
    return mocks.mnList.find(mn => mn.publicAdr == pubAdr) &&
            Message(message).verify(pubAdr, signature);
  }

  writeValue(privKey, pubAdr, value, key = 'dapi_default_key') {
    const message = {
      signature: Message(value.toString()).sign(new PrivateKey(privKey)),
      publicAdr: pubAdr,
      value: value.toString(),
    };

    this.kvs.set(key, message)
      .then(() => {
        console.log(this.kvs.get(key));
      });
  }

  getValue(key = 'message') {
    const d = this.kvs.get(key);

    if (d && this.isMnMessage(d.signature, d.publicAdr, d.value)) {
      return d;
    }

    return false;
  }

  contains(key) {
    return this.kvs.get(key) !== 'undefined';
  }
}

module.exports = KeyValueStore;
