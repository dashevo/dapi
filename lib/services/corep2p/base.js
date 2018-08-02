const p2p = require('@dashevo/dashcore-p2p');
const p2pConfig = require('../../config').dashcore.p2p;
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
    this.peer = null;
  }

  createPeer() {
    const peer = new p2p.Peer(p2pConfig);

    return new Promise((resolve, reject) => {
      peer.once('ready', () => {
        this.peer = peer;
        initListeners(this.peer);
        resolve(this.peer);
      });

      peer.once('disconnect', (err) => {
        reject(new Error(err));
      });

      peer.connect();
    });
  }
}

module.exports = Base;
