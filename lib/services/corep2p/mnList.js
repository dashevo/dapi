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
    this.peer.on('mnlistdiff', () => {
      // TODO
    });
  }

  getMnListDiff(baseBlockHash, blockHash) {
    const req = {
      baseBlockHash,
      blockHash,
    };
    this.peer.sendMessage(this.peer.messages.GetMnListDiff(req));

    // TODO: return result
  }
}

module.exports = MnListService;
