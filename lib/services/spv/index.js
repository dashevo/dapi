// temporary implementation (will likely not use p2p in future)
const p2p = require('bitcore-p2p-dash');
const log = require('../../log');
const Cache = require('../caching/spvSimpleCache');
const hash = require('object-hash');

function getCorrectedHash(reversedHashObj) {
  const clone = Buffer.alloc(32);
  reversedHashObj.copy(clone);
  return clone.reverse().toString('hex');
}

class spvService {
  constructor(config) {
    this.peer = new p2p.Peer(config);
    this.filterHash = null; // todo: remove when core spv/rpc available
    this.hasFilters = false;
    this.cache = new Cache();
  }

  start() {
    this.peer.connect();
    return new Promise((resolve, reject) => {
      this.peer.once('ready', () => {
        resolve();
      });

      this.peer.once('disconnect', () => {
        log.info('Peer disconnected...');
        reject();
      });
    });
  }

  initListeners() {
    this.peer.on('inv', (message) => {
      message.inventory.forEach((m) => {
        const cHash = getCorrectedHash(m.hash);
        switch (m.type) {
          case 1: // MSG_TX: if bloomfilter set this only happens on matched txs + false positives
            this.peer.sendMessage(this.peer.messages.GetData.forTransaction(cHash));
            break;
          case 2: // MSG_BLOCK: not needed for SPV - keeping for testing purposes
            this.peer.sendMessage(this.peer.messages.GetData.forBlock(cHash));
            break;
          case 3:
            // MSG_FILTERED_BLOCK: NOTE: This never happens regardless of bloomfilter set or not
            this.peer.sendMessage(this.peer.messages.GetData.forFilteredBlock(cHash));
            break;
          default:
        }
      });
    });

    this.peer.on('tx', (message) => {
      // future implementation will return filterHash as part of message
      this.cache.set(message.filterHash || this.filterHash, message.transaction);
      log.info(`DAPI: tx ${message.transaction.hash} added to cache`);
    });

    this.peer.on('merkleblock', (message) => {
      // future implementation will return filterHash as part of message
      this.cache.set(message.filterHash || this.filterHash, message.merkleBlock);
      log.info(`DAPI: merkleblock with ${message.merkleBlock.hashes.length} hashe(s) added to cache`);
    });
  }

  // clientKey not used but will be used in future to associate
  // a spesific client with specific filter
  loadBloomFilter(filter) {
    if (!this.hasFilters) {
      this.hasFilters = true;
      this.filterHash = hash(filter);
      this.initListeners();
    }
    this.peer.sendMessage(this.peer.messages.FilterLoad(filter));
  }

  clearBoomFilter(bloomFilter) {
    this.peer.sendMessage(this.peer.clearBoomFilter(bloomFilter));
  }

  addFilter(clientkey, element) {
    this.peer.sendMessage(this.peer.addFilter(element));
  }

  getData(bloomFilter) {
    return this.cache.get(hash(bloomFilter));
  }

  getMerkleBlocks(fromBlockHash) {
    const msg = this.peer.messages.GetBlocks({
      starts: [fromBlockHash],
    });
    this.peer.sendMessage(msg);
  }
}

module.exports = spvService;
