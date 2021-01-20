const EventEmitter = require('events');
const TransactionsClient = require('../../../../lib/externalApis/tenderdash/TransactionsClient');
const TransactionWaitPeriodExceededError = require('../../../../lib/errors/TransactionWaitPeriodExceededError');

describe('TransactionClient', () => {
  let sinon;
  let wsClientMock;
  let transactionsClient;
  let txDataMock;

  beforeEach(function beforeEach() {
    ({ sinon } = this);
    wsClientMock = new EventEmitter();
    wsClientMock.subscribe = sinon.stub();
    transactionsClient = new TransactionsClient(wsClientMock);

    txDataMock = {
      events: {
        'tx.hash': '123',
      },
    };

    sinon.spy(transactionsClient, 'on');
    sinon.spy(transactionsClient, 'off');
    sinon.spy(transactionsClient, 'emit');
  });

  describe('constructor', () => {
    it('should subscribe to transaction events from WS client', () => {
      expect(wsClientMock.subscribe).to.be.calledOnce();
      expect(wsClientMock.subscribe).to.be.calledWithExactly(TransactionsClient.TX_QUERY);
    });
  });

  describe('.getTransactionEventName', () => {
    it('should return transaction event name', () => {
      const eventName = TransactionsClient.getTransactionEventName('123');
      expect(eventName).to.be.equal('transaction:123');
    });
  });

  describe('#waitForTransaction', () => {
    it('should remove listener after transaction resolves', async () => {
      const eventName = TransactionsClient.getTransactionEventName('123');
      const txPromise = transactionsClient.waitForTransaction('123', 2000);

      expect(transactionsClient.listenerCount(eventName)).to.be.equal(1);

      setTimeout(() => {
        wsClientMock.emit(TransactionsClient.TX_QUERY, Object.assign({}, txDataMock));
      }, 10);

      const txData = await txPromise;

      // Check that event listener was properly attached
      expect(transactionsClient.on).to.be.calledOnce();
      // Check that transaction data was emitted
      expect(transactionsClient.emit).to.be.calledOnce();
      // Check that the event listener was properly removed
      expect(transactionsClient.off).to.be.calledOnce();
      expect(transactionsClient.listenerCount(eventName)).to.be.equal(0);

      expect(txData).to.be.deep.equal(txDataMock);
    });

    it('should not emit transaction event if event data has no transaction', async () => {
      const eventName = TransactionsClient.getTransactionEventName('123');
      txDataMock = {};

      let error;
      try {
        const txPromise = transactionsClient.waitForTransaction('123', 1000);

        expect(transactionsClient.listenerCount(eventName)).to.be.equal(1);

        setTimeout(() => {
          wsClientMock.emit(TransactionsClient.TX_QUERY, Object.assign({}, txDataMock));
        }, 10);

        await txPromise;
      } catch (e) {
        error = e;
      }

      // Check that the error is correct
      expect(error).to.be.instanceOf(TransactionWaitPeriodExceededError);
      expect(error.message).to.be.equal('Transaction waiting period for 123 exceeded');
      expect(error.getTransactionHash()).to.be.equal('123');

      // Check that event listener was properly attached
      expect(transactionsClient.on).to.be.calledOnce();
      // Check that event listener was properly removed
      expect(transactionsClient.off).to.be.calledOnce();
      expect(transactionsClient.listenerCount(eventName)).to.be.equal(0);
      // Check that no transaction data was emitted
      expect(transactionsClient.emit).to.not.be.called();
    });

    it('should remove listener after timeout has been exceeded', async () => {
      const eventName = TransactionsClient.getTransactionEventName('123');
      let error;
      try {
        await transactionsClient.waitForTransaction('123', 100);
      } catch (e) {
        error = e;
      }

      // Check that the error is correct
      expect(error).to.be.instanceOf(TransactionWaitPeriodExceededError);
      expect(error.message).to.be.equal('Transaction waiting period for 123 exceeded');
      expect(error.getTransactionHash()).to.be.equal('123');

      // Check that event listener was properly attached
      expect(transactionsClient.on).to.be.calledOnce();
      // Check that event listener was properly removed
      expect(transactionsClient.off).to.be.calledOnce();
      expect(transactionsClient.listenerCount(eventName)).to.be.equal(0);
      // Check that no transaction data was emitted
      expect(transactionsClient.emit).to.not.be.called();
    });
  });
});
