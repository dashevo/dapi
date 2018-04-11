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
    this.config = config;
    this.peers = [];
    this.filterHash = null; // todo: remove when core spv/rpc available
    this.hasFilters = false;
    this.cache = new Cache();
  }

  createNewPeer(filterHash) {
    this.peers.push({
      hash: filterHash,
      peer: new p2p.Peer(this.config),
      hasFilters:true
    });
    const idx = this.peers.length-1;

    const peer = this.peers[idx].peer;
    peer.connect();
    return new Promise((resolve, reject) => {
      peer.once('ready', () => {
        resolve(peer);
      });

      peer.once('disconnect', () => {
        log.info('Peer disconnected...');
        reject(new Error('Not able to establish p2p connection to dashcore'));
      });
    });
  }

  initListeners(peer) {
    peer.on('inv', (message) => {
      message.inventory.forEach((m) => {
        const cHash = getCorrectedHash(m.hash);
        switch (m.type) {
          case 1:
            peer.sendMessage(peer.messages.GetData.forTransaction(cHash));
            break;
          case 2:
            peer.sendMessage(peer.messages.GetData.forFilteredBlock(cHash));
            break;
          default:
        }
      });
    });

    peer.on('tx', (message) => {
      // future implementation will return filterHash as part of message
      this.cache.set(message.filterHash || peer.filterHash, message.transaction);
      log.info(`DAPI: tx ${message.transaction.hash} added to cache`);
    });

    peer.on('merkleblock', (message) => {
      // future implementation will return filterHash as part of message
      this.cache.set(message.filterHash || peer.filterHash, message.merkleBlock);
      log.info(`DAPI: merkleblock with ${message.merkleBlock.hashes.length} hash(es) added to cache`);
    });
  }

  // clientKey not used but will be used in future to associate
  // a spesific client with specific filter
  loadBloomFilter(filter) {
    const filterHash = hash(filter);

    return new Promise((resolve, reject) => {
      //This peer doesn't exist, so we create it
      if ((this.peers.filter(obj => obj.hash === filterHash).length) === 0) {
        this
          .createNewPeer(filterHash)
          .then((peer) => {
            console.log('Created new peer', filterHash)
            if (!peer.hasFilters) {
              peer.hasFilters = true;
              peer.hash = filterHash;
              this.initListeners(peer);
            }
            peer.sendMessage(peer.messages.FilterLoad(filter));
          });
      }
      resolve(true);
    });
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

  getBlockHashes(fromBlockHash) {
    const msg = this.peer.messages.GetBlocks({
      starts: [fromBlockHash],
    });
    this.peer.sendMessage(msg);
  }
}

module.exports = spvService;
