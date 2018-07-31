const Base = require('./base');

class MnListService extends Base {
  constructor() {
    super();
    this.peer = this.createPeer()
      .then(() => {
        // TODO
      });
  }

  initMnListListeners() {
    this.peer.on('mnlistdiff', (message) => {
      // TODO
    });
  }

  getMnListDiff() {
    const reqMsg = {
      baseBlockHash: '123',
      blockHash: 456,
    };
    this.peer.sendMessage(this.peer.messages.MnDiffList(reqMsg));
  }
}

module.exports = MnListService;
