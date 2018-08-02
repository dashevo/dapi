const hash = require('object-hash');
const Cache = require('../caching/spvSimpleCache');
const Base = require('./base');
const { clearDisconnectedClientBloomFilters } = require('./utils');


class SpvService extends Base {
  constructor() {
    super();

    this.cache = new Cache();
    this.clients = [];
    const { bloomFilterPersistenceTimeout } = this.config;
    setInterval(() => {
      this.clients =
        clearDisconnectedClientBloomFilters({ clients: this.clients, currentTime: Date.now() });
      this.cache.clearInactiveClients(this.clients.map(client => client.filterHash));
    }, bloomFilterPersistenceTimeout);
  }

  updateLastSeen(filter) {
    this.clients.find(client => client.filterHash === hash(filter)).lastSeen = Date.now();
  }

  createNewClient(filter) {
    return {
      peer: this.createPeer(),
      filter,
      filterHash: hash(filter),
      lastSeen: Date.now(),
    };
  }

  initSPVListeners(client, peer) {
    peer.on('tx', (message) => {
      this.cache.set(client.filterHash, message.transaction);
      this.logger.info(`DAPI: tx ${message.transaction.hash} added to cache`);
    });

    peer.on('merkleblock', (message) => {
      // Rudimentary assumption of which blocks contains merkle proofs
      // Discussion: https://dashpay.atlassian.net/browse/EV-847
      if (message.merkleBlock.hashes.length > 1) {
        this.cache.set(client.filterHash, message.merkleBlock);
        this.logger.info(`DAPI: merkleblock with ${message.merkleBlock.hashes.length} hash(es) added to cache`);
      }
    });
  }

  hasPeerInClients(filter) {
    this.updateLastSeen(filter);
    const filterHash = hash(filter);
    return this.clients.filter(client => client.filterHash === filterHash).length > 0;
  }

  getPeerFromClients(filter) {
    this.updateLastSeen(filter);
    const filterHash = hash(filter);
    return this.clients.filter(client => client.filterHash === filterHash)[0].peer;
  }

  loadBloomFilter(filter) {
    return new Promise((resolve, reject) => {
      // This peer doesn't exist, so we create it
      const filterHash = hash(filter);
      if (!this.hasPeerInClients(filter)) {
        this
          .createNewClient(filter)
          .then((client) => {
            this.clients.push(client);
            this.initSPVListeners(client.peer);
            this.logger.info('Created new peer with bloomfilter hash:', filterHash);

            const peer = this.getPeerFromClients(filter);
            peer.sendMessage(peer.messages.FilterLoad(filter));
            resolve(true);
          })
          .catch(err => reject(err));
      } else {
        resolve(true);
      }
    });
  }

  clearBoomFilter(filter) {
    if (this.hasPeerInClients(filter)) {
      const peer = this.getPeerFromClients(filter);
      peer.sendMessage(peer.clearBoomFilter(filter));
    } else {
      this.logger.error('Attempting to clear a filter that has not been set');
    }
  }

  // Todo: rethink logic of using filter as client unique id
  addToBloomFilter(originalFilter, element) {
    if (this.hasPeerInClients(originalFilter)) {
      const peer = this.getPeerFromClients(originalFilter);
      peer.sendMessage(peer.addFilter(element));
    } else {
      this.logger.error('No matching original filter. Please load a filter first');
    }
  }

  getData(filter) {
    this.updateLastSeen(filter);
    return this.cache.get(hash(filter));
  }

  getBlockHashes(filter, fromBlockHash) {
    this.updateLastSeen(filter);
    const peer = this.getPeerFromClients(filter);
    const msg = peer.messages.GetBlocks({
      starts: [fromBlockHash],
    });
    this.peer.sendMessage(msg);
  }

  getMerkleBlocks(filter, blockHash) {
    const peer = this.getPeerFromClients(filter);
    peer.sendMessage(peer.messages.GetData.forFilteredBlock(blockHash));
  }
}

module.exports = SpvService;
