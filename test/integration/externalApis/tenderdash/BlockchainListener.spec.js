const EventEmitter = require('events');
const BlockchainListener = require('../../../../lib/externalApis/tenderdash/blockchainListener/BlockchainListener');

describe('BlockchainListener', () => {
  let sinon;
  let wsClientMock;
  let blockchainListener;

  beforeEach(function beforeEach() {
    ({ sinon } = this);
    wsClientMock = new EventEmitter();
    wsClientMock.subscribe = sinon.stub();
    blockchainListener = new BlockchainListener(wsClientMock);
    blockchainListener.start();

    sinon.spy(blockchainListener, 'on');
    sinon.spy(blockchainListener, 'off');
    sinon.spy(blockchainListener, 'emit');
  });

  describe('#start', () => {
    it('should subscribe to transaction events from WS client', () => {
      expect(wsClientMock.subscribe).to.be.calledTwice();
      expect(wsClientMock.subscribe.firstCall).to.be.calledWithExactly(
        BlockchainListener.TX_QUERY,
      );
      expect(wsClientMock.subscribe.secondCall).to.be.calledWithExactly(
        BlockchainListener.NEW_BLOCK_QUERY,
      );
    });
  });
});
