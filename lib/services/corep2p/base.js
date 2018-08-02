const p2p = require('@dashevo/dashcore-p2p');
const config = require('../../config');
const utils = require('../../utils');

class Base {
  constructor() {
    this.config = config.dashcore.p2p;
    this.peer = null;
  }

  createPeer() {
    const peer = new p2p.Peer(this.config);

    return new Promise((resolve, reject) => {
      peer.once('ready', () => {
        this.peer = peer;
        this.initListeners(this.peer);
        resolve(this.peer);
      });

      peer.once('disconnect', (err) => {
        reject(new Error(err));
      });

      peer.connect();
    });
  }

  initListeners() {
    this.peer.on('inv', (message) => {
      message.inventory.forEach((m) => {
        const cHash = utils.getCorrectedHash(m.hash);
        switch (m.type) {
          case 1:
            this.peer.sendMessage(this.peer.messages.GetData.forTransaction(cHash));
            break;
          case 2:
            this.peer.sendMessage(this.peer.messages.GetData.forFilteredBlock(cHash));
            break;
          default:
        }
      });
    });
  }
}

module.exports = Base;
