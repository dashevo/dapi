// temporary implementation (will likely not use p2p in future)
const p2p = require('bitcore-p2p-dash');

class spvService {
  constructor(config) {
    this.peer = new p2p.Peer(config);
  }

  start() {
    this.peer.connect();
    return new Promise((resolve) => {
      this.peer.once('ready', () => {
        resolve();
      });
    });
  }
}

module.exports = spvService;
