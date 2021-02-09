const EventEmitter = require('events');
const crypto = require('crypto');
const BlockchainListener = require('../../../../lib/externalApis/tenderdash/BlockchainListener');
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

  describe('.getTransactionEventName', () => {
    it('should return transaction event name', () => {
      const eventName = BlockchainListener.getTransactionEventName(txHash);
      expect(eventName).to.be.equal(`transaction:${txHash}`);
    });
  });

  describe('#waitForTransaction', () => {
    it('should remove listener after transaction resolves', async () => {
      const txPromise = blockchainListener.waitForTransactionToBeProvable(txHash, 2000);

      // check that we attached events correctly
      const events = blockchainListener.eventNames();
      // transaction result, transaction in block an block events
      expect(events.length).to.be.equal(3);
      events.forEach((eventName) => {
        expect(blockchainListener.listenerCount(eventName)).to.be.equal(1);
      });

      setTimeout(() => {
        wsClientMock.emit(BlockchainListener.TX_QUERY, Object.assign({}, txDataMock));
        wsClientMock.emit(BlockchainListener.NEW_BLOCK_QUERY, Object.assign({}, blockWithTxMock));
        wsClientMock.emit(BlockchainListener.NEW_BLOCK_QUERY, Object.assign({}, emptyBlockMock));
      }, 10);

      const txData = await txPromise;

      // Check that event listener was properly attached
      expect(blockchainListener.on).to.be.calledThrice();
      // Check that the event listener was properly removed
      expect(blockchainListener.off).to.be.calledTwice();
      events.forEach((eventName) => {
        expect(blockchainListener.listenerCount(eventName)).to.be.equal(0);
      });

      expect(txData).to.be.deep.equal(txDataMock);
    });

    it('should not emit transaction event if event data has no transaction', async () => {
      let events;
      let error;
      try {
        const txPromise = blockchainListener.waitForTransactionToBeProvable(txHash, 1000);

        // check that we attached events correctly
        events = blockchainListener.eventNames();
        // transaction result, transaction in block an block events
        expect(events.length).to.be.equal(3);
        events.forEach((eventName) => {
          expect(blockchainListener.listenerCount(eventName)).to.be.equal(1);
        });

        setTimeout(() => {
          wsClientMock.emit(BlockchainListener.NEW_BLOCK_QUERY, Object.assign({}, blockWithTxMock));
        }, 10);

        await txPromise;
      } catch (e) {
        error = e;
      }

      // Check that the error is correct
      expect(error).to.be.instanceOf(TransactionWaitPeriodExceededError);
      expect(error.message).to.be.equal(`Transaction waiting period for ${txHash} exceeded`);
      expect(error.getTransactionHash()).to.be.equal(txHash);

      // Check that event listener was properly attached
      expect(blockchainListener.on).to.be.calledThrice();
      events.forEach((eventName) => {
        expect(blockchainListener.listenerCount(eventName)).to.be.equal(0);
      });
      // Check that no transaction data was emitted
      expect(blockchainListener.emit).to.be.calledTwice();
    });

    it('should remove listener after timeout has been exceeded', async () => {
      let events;
      let error;
      try {
        const txPromise = blockchainListener.waitForTransactionToBeProvable(txHash, 100);

        events = blockchainListener.eventNames();
        expect(events.length).to.be.equal(3);
        events.forEach((eventName) => {
          expect(blockchainListener.listenerCount(eventName)).to.be.equal(1);
        });

        await txPromise;
      } catch (e) {
        error = e;
      }

      // Check that the error is correct
      expect(error).to.be.instanceOf(TransactionWaitPeriodExceededError);
      expect(error.message).to.be.equal(`Transaction waiting period for ${txHash} exceeded`);
      expect(error.getTransactionHash()).to.be.equal(txHash);

      // Check that event listener was properly attached
      expect(blockchainListener.on).to.be.calledThrice();
      // Check that event listener was properly removed
      expect(blockchainListener.off).to.be.calledThrice();

      events.forEach((eventName) => {
        expect(blockchainListener.listenerCount(eventName)).to.be.equal(0);
      });
      // Check that no transaction data was emitted
      expect(blockchainListener.emit).to.not.be.called();
    });
  });
});
