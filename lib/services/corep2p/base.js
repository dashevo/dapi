const p2p = require('@dashevo/dashcore-p2p');
const config = require('../../config');
const utils = require('../../utils');

const initListeners = (peer) => {
  peer.on('inv', (message) => {
    message.inventory.forEach((m) => {
      const cHash = utils.getCorrectedHash(m.hash);
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
};

class Base {
  constructor() {
    this.config = config.dashcore.p2p;
  }

  createPeer() {
    const peer = new p2p.Peer(this.config);
    peer.connect();
    return new Promise((resolve, reject) => {
      peer.once('ready', () => {
        initListeners(peer);
        resolve(peer);
      });

      peer.once('disconnect', () => {
        reject(new Error('Peer disconneted'));
      });
    });
  }
}

module.exports = Base;
