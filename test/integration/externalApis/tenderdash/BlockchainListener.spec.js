const EventEmitter = require('events');
const crypto = require('crypto');
const BlockchainListener = require('../../../../lib/externalApis/tenderdash/blockchainListener/BlockchainListener');
const TransactionWaitPeriodExceededError = require('../../../../lib/errors/TransactionWaitPeriodExceededError');

describe('BlockchainListener', () => {
  let sinon;
  let wsClientMock;
  let blockchainListener;
  let txDataMock;
  const base64tx = 'aaaa';
  let txHash;
  let blockWithTxMock;
  let emptyBlockMock;

  beforeEach(function beforeEach() {
    ({ sinon } = this);
    wsClientMock = new EventEmitter();
    wsClientMock.subscribe = sinon.stub();
    blockchainListener = new BlockchainListener(wsClientMock);
    blockchainListener.start();

    txHash = crypto.createHash('sha256')
      .update(Buffer.from(base64tx, 'base64'))
      .digest()
      .toString('hex');

    txDataMock = {
      events: {
        'tx.hash': [txHash],
      },
    };

    blockWithTxMock = {
      data: { value: { block: { data: { txs: [base64tx] } } } },
    };
    emptyBlockMock = {
      data: { value: { block: { data: { txs: [] } } } },
    };

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
