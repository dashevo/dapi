// temporary implementation (will likely not use p2p in future)
const p2p = require('bitcore-p2p-dash');
const log = require('../../log');

// Simple cache structure for now until dapi's caching service
// has been agreed apon and finislied.
const cache = [];

function updateCache(bloomfilter, updateObj) {
  // Init
  cache[bloomfilter] = cache[bloomfilter] ||
        {
          transactions: {},
          merkleblocks: {},
        };

  if (updateObj.constructor.name === 'Transaction') {
    cache[bloomfilter].transactions.push(updateObj);
  } else {
    cache[bloomfilter].merkleblocks.push(updateObj);
  }
}

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
      // future implementation will return bloomFilter as part of message
      updateCache(message.bloomFilter || '_id1', message.transaction);
      log.info(`tx ${message.transaction.hash}`);
    });

    this.peer.on('merkleblock', (message) => {
      // future implementation will return bloomFilter as part of message
      updateCache(message.bloomFilter || '_id1', message.merkleBlock);
      log.info(`merkleblock ${message}`);
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

  static getMessages(bloomFilter) {
    return cache[bloomFilter];
  }
}

module.exports = spvService;
