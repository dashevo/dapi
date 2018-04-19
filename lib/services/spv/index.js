// temporary implementation (will likely not use p2p in future)
const p2p = require('bitcore-p2p-dash');
const log = require('../../log');
const Cache = require('../caching/spvSimpleCache');
const hash = require('object-hash');
const config = require('../../config');

function getCorrectedHash(reversedHashObj) {
  const clone = Buffer.alloc(32);
  reversedHashObj.copy(clone);
  return clone.reverse().toString('hex');
}

class SpvService {
  constructor() {
    this.config = config.dashcore.p2p;
    this.clients = [];
    this.cache = new Cache();
  }

  createNewClient(filter) {
    const client = {
      filterHash: hash(filter),
      peer: new p2p.Peer(this.config),
    };
    this.clients.push(client);

    const { peer } = client;
    peer.connect();
    return new Promise((resolve, reject) => {
      peer.once('ready', () => {
        resolve(client);
      });

      peer.once('disconnect', () => {
        log.info('Peer disconnected...');
        reject(new Error('Not able to establish p2p connection to dashcore'));
      });
    });
  }

  initListeners(client, filter) {
    const peer = this.getPeerFromClients(filter);
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
      this.cache.set(message.filterHash || client.filterHash, message.transaction);
      log.info(`DAPI: tx ${message.transaction.hash} added to cache`);
    });

    peer.on('merkleblock', (message) => {
      // future implementation will return filterHash as part of message
      this.cache.set(message.filterHash || client.filterHash, message.merkleBlock);
      log.info(`DAPI: merkleblock with ${message.merkleBlock.hashes.length} hash(es) added to cache`);
    });
  }

  hasPeerInClients(filter) {
    const filterHash = hash(filter);
    return this.clients.filter(client => client.filterHash === filterHash).length > 0;
  }

  getPeerFromClients(filter) {
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
            this.initListeners(client, filter);
            log.info('Created new peer with bloomfilter hash:', filterHash);

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
      log.error('Attempting to clear a filter that has not been set');
    }
  }

  // Todo: rethink logic of using filter as client unique id
  addFilter(originalFilter, element) {
    if (this.hasPeerInClients(originalFilter)) {
      const peer = this.getPeerFromClients(originalFilter);
      peer.sendMessage(peer.addFilter(element));
    } else {
      log.error('No matching original filter. Please load a filter first');
    }
  }

  getData(filter) {
    return this.cache.get(hash(filter));
  }

  getBlockHashes(filter, fromBlockHash) {
    const peer = this.getPeerFromClients(filter);
    const msg = peer.messages.GetBlocks({
      starts: [fromBlockHash],
    });
    this.peer.sendMessage(msg);
  }
}


module.exports = new SpvService();
