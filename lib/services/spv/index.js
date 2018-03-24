// temporary implementation (will likely not use p2p in future)
const p2p = require('bitcore-p2p-dash');

class spvService {
  constructor(config) {
    this.peer = new p2p.Peer(config);
  }

  start() {
    function getCorrectedHash(reversedHashObj) {
      const clone = Buffer.alloc(32);
      reversedHashObj.copy(clone);
      return clone.reverse().toString('hex');
    }

    this.peer.on('inv', (message) => {
      message.inventory.forEach((m) => {
        const hash = getCorrectedHash(m.hash);
        switch (m.type) {
          case 1:
            this.peer.sendMessage(this.peer.messages.GetData.forTransaction(hash));
            break;
          case 2:
            this.peer.sendMessage(this.peer.messages.GetData.forFilteredBlock(hash));
            break;
          default:
        }
      });
    });

    this.peer.on('tx', (message) => {
      console.log(`tx ${message.transaction.hash}`);
    });

    this.peer.on('merkleblock', (message) => {
      console.log(`merkleblock ${message}`);
    });

    this.peer.connect();
    return new Promise((resolve) => {
      this.peer.once('ready', () => {
        resolve();
      });
    });
  }

  // clientKey not used but will be used in future to associate
  // a spesific client with specific filter
  loadBloomFilter(clientKey, filter) {
    this.peer.loadBloomFilter(filter);
  }
  // eslint-disable-next-line no-unused-vars
  clearBoomFilter(clientKey) {
    this.peer.clearBoomFilter();
  }

  addFilter(clientkey, element) {
    this.peer.addFilter(element);
  }
}

module.exports = spvService;
