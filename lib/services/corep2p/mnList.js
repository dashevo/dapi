const Base = require('./base');

class MnListService extends Base {
  constructor() {
    super();
    this.peer = this.createPeer()
      .then(() => {
        this.initMnListListeners();
      });
  }

  initMnListListeners() {
    this.peer.on('mnlistdiff', (message) => {
      // TODO
    });
  }

  getMnListDiff(baseBlockHash, blockHash) {
    const req = {
      baseBlockHash,
      blockHash,
    };
    this.peer.sendMessage(this.peer.messages.MnDiffList(req));
  }
}

module.exports = MnListService;
