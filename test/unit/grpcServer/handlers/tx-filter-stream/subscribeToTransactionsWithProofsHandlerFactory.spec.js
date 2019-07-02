const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const { TransactionsWithProofsResponse, RawTransactions } = require('@dashevo/dapi-grpc');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');
const subscribeToTransactionsWithProofsHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/tx-filter-stream/subscribeToTransactionsWithProofsHandlerFactory',
);

const ProcessMediator = require('../../../../../lib/transactionsFilter/ProcessMediator');

const InvalidArgumentError = require('../../../../../lib/grpcServer/error/InvalidArgumentError');

const AcknowledgingWritable = require('../../../../../lib/utils/AcknowledgingWritable');

use(sinonChai);
use(chaiAsPromised);
use(dirtyChai);

describe('subscribeToTransactionsWithProofsHandlerFactory', () => {
  beforeEach(function beforeEach() {
    if (!this.sinon) {
      this.sinon = sinon.createSandbox();
    } else {
      this.sinon.restore();
    }
  });

  afterEach(function afterEach() {
    this.sinon.restore();
  });

  let call;
  let callback;
  let subscribeToTransactionsWithProofsHandler;
  let bloomFilterEmitterCollectionMock;
  let historicalTxData;
  let getHistoricalTransactionsIteratorMock;
  let subscribeToNewTransactionsMock;
  let testTransactionAgainstFilterMock;
  let coreAPIMock;

  beforeEach(function beforeEach() {
    call = new GrpcCallMock(this.sinon);
    callback = this.sinon.stub();

    bloomFilterEmitterCollectionMock = {};

    historicalTxData = [];
    getHistoricalTransactionsIteratorMock = function* generator() {
      for (let i = 0; i < historicalTxData.length; i++) {
        yield historicalTxData[i];
      }
    };

    subscribeToNewTransactionsMock = this.sinon.stub();
    testTransactionAgainstFilterMock = this.sinon.stub();

    coreAPIMock = {
      getBlock: this.sinon.stub(),
      getBestBlockHeight: this.sinon.stub(),
    };

    subscribeToTransactionsWithProofsHandler = subscribeToTransactionsWithProofsHandlerFactory(
      getHistoricalTransactionsIteratorMock,
      subscribeToNewTransactionsMock,
      bloomFilterEmitterCollectionMock,
      testTransactionAgainstFilterMock,
      coreAPIMock,
    );

    this.sinon.spy(ProcessMediator.prototype, 'emit');
    this.sinon.spy(ProcessMediator.prototype, 'on');
  });

  it('should respond with error if bloom filter is not valid', async () => {
    // Create a wrong bloom filter
    call.request = {
      bloomFilter: {
        nHashFuncs: 100,
        nTweak: 1000,
        nFlags: 100,
        vData: [],
      },
    };

    await subscribeToTransactionsWithProofsHandler(call, callback);

    expect(callback).to.have.been.calledOnce();
    expect(callback.getCall(0).args).to.have.lengthOf(2);

    const [error, response] = callback.getCall(0).args;

    expect(error).to.be.instanceOf(InvalidArgumentError);
    expect(error.getMessage()).to.equal('Invalid argument: Invalid bloom filter: '
      + '"nHashFuncs" exceeded max size "50"');

    expect(response).to.be.null();

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.not.have.been.called();
  });

  it('should respond with error if both fromBlockHash and fromBlockHeight are not specified', async () => {
    // Create a wrong bloom filter
    call.request = {
      bloomFilter: {
        nHashFuncs: 10,
        nTweak: 1000,
        nFlags: 100,
        vData: [],
      },
    };

    await subscribeToTransactionsWithProofsHandler(call, callback);

    expect(callback).to.have.been.calledOnce();
    expect(callback.getCall(0).args).to.have.lengthOf(2);

    const [error, response] = callback.getCall(0).args;

    expect(error).to.be.instanceOf(InvalidArgumentError);
    expect(error.getMessage()).to.equal(
      'Invalid argument: Either fromBlockHash or fromBlockHeight should be specified',
    );

    expect(response).to.be.null();

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.not.have.been.called();
  });

  it('should respond with error if fromBlockHeight exceeded blockchain length', async () => {
    call.request = {
      bloomFilter: {
        nHashFuncs: 50,
        nTweak: 1000,
        nFlags: 100,
        vData: [],
      },
      fromBlockHeight: 100,
    };

    coreAPIMock.getBestBlockHeight.resolves(10);

    await subscribeToTransactionsWithProofsHandler(call, callback);

    expect(callback).to.have.been.calledOnce();
    expect(callback.getCall(0).args).to.have.lengthOf(2);

    const [error, response] = callback.getCall(0).args;

    expect(error).to.be.instanceOf(InvalidArgumentError);
    expect(error.getMessage()).to.equal('Invalid argument: fromBlockHeight is bigger than block count');

    expect(response).to.be.null();

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.not.have.been.called();
  });

  it('should respond with error if requested data length exceeded blockchain length', async () => {
    call.request = {
      bloomFilter: {
        nHashFuncs: 50,
        nTweak: 1000,
        nFlags: 100,
        vData: [],
      },
      fromBlockHash: 'someBlockHash',
      count: 100,
    };

    coreAPIMock.getBlock.resolves({ height: 1 });
    coreAPIMock.getBestBlockHeight.resolves(10);

    await subscribeToTransactionsWithProofsHandler(call, callback);

    expect(callback).to.have.been.calledOnce();
    expect(callback.getCall(0).args).to.have.lengthOf(2);

    const [error, response] = callback.getCall(0).args;

    expect(error).to.be.instanceOf(InvalidArgumentError);
    expect(error.getMessage()).to.equal(
      'Invalid argument: count is too big, could not fetch more than blockchain length',
    );

    expect(response).to.be.null();

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.not.have.been.called();
  });


  it('should subscribe to new transactions if count is not specified', async function it() {
    call.request = {
      bloomFilter: {
        nHashFuncs: 50,
        nTweak: 1000,
        nFlags: 100,
        vData: [],
      },
      fromBlockHash: 'someBlockHash',
      count: 0,
    };

    const writableStub = this.sinon.stub(AcknowledgingWritable.prototype, 'write');

    coreAPIMock.getBlock.resolves({ height: 1 });
    coreAPIMock.getBestBlockHeight.resolves(10);

    historicalTxData.push({
      merkleBlock: {
        toBuffer: () => Buffer.from('someHash'),
        header: {
          hash: 'someHash',
        },
      },
      transactions: [
        {
          toBuffer: () => Buffer.from(
            'edefad1c70ee6736a0a0c2f9be7f22cfcf77ae2c120704a98cdc9aebdab7ffc5', 'hex',
          ),
        },
      ],
    });

    await subscribeToTransactionsWithProofsHandler(call, callback);

    expect(subscribeToNewTransactionsMock).to.have.been.calledOnce();
    expect(writableStub).to.have.been.calledTwice();

    const firstResponse = new TransactionsWithProofsResponse();
    const rawTransactions = new RawTransactions();
    rawTransactions.setTransactionsList(
      historicalTxData[0].transactions.map(tx => tx.toBuffer()),
    );
    firstResponse.setRawTransactions(rawTransactions);

    const secondResponse = new TransactionsWithProofsResponse();
    secondResponse.setRawMerkleBlock(historicalTxData[0].merkleBlock.toBuffer());

    expect(writableStub.getCall(0).args).to.deep.equal(
      [firstResponse.toObject()],
    );

    expect(writableStub.getCall(1).args).to.deep.equal(
      [secondResponse.toObject()],
    );
  });

  it('should end call and emit CLIENT_DISCONNECTED event when client disconnects', async () => {
    call.request = {
      bloomFilter: {
        nHashFuncs: 50,
        nTweak: 1000,
        nFlags: 100,
        vData: [],
      },
      fromBlockHash: 'someHash',
    };

    await subscribeToTransactionsWithProofsHandler(call, callback);

    // Client disconnects
    call.emit('cancelled');

    // Bloom filters was removed when client disconnects
    expect(ProcessMediator.prototype.emit).to.be.calledOnceWith(
      ProcessMediator.EVENTS.CLIENT_DISCONNECTED,
    );

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.have.been.calledOnce();
    expect(callback).to.have.been.calledOnceWith(null, null);
  });
});
