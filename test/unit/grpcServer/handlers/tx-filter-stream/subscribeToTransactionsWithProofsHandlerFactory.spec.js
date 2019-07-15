const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const {
  TransactionsWithProofsRequest,
  TransactionsWithProofsResponse,
  RawTransactions,
  BloomFilter,
} = require('@dashevo/dapi-grpc');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');
const subscribeToTransactionsWithProofsHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/tx-filter-stream/subscribeToTransactionsWithProofsHandlerFactory',
);

const ProcessMediator = require('../../../../../lib/transactionsFilter/ProcessMediator');

const InvalidArgumentGrpcError = require('../../../../../lib/grpcServer/error/InvalidArgumentGrpcError');

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
  let subscribeToTransactionsWithProofsHandler;
  let bloomFilterEmitterCollectionMock;
  let historicalTxData;
  let getHistoricalTransactionsIteratorMock;
  let subscribeToNewTransactionsMock;
  let testTransactionAgainstFilterMock;
  let coreAPIMock;

  beforeEach(function beforeEach() {
    const bloomFilterMessage = new BloomFilter();

    bloomFilterMessage.setVData(new Uint8Array());
    bloomFilterMessage.setNTweak(1000);
    bloomFilterMessage.setNFlags(100);
    bloomFilterMessage.setNHashFuncs(10);

    const request = new TransactionsWithProofsRequest();

    request.setBloomFilter(bloomFilterMessage);

    call = new GrpcCallMock(this.sinon, request);

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
    const bloomFilterMessage = new BloomFilter();

    bloomFilterMessage.setVData(new Uint8Array());
    bloomFilterMessage.setNTweak(1000);
    bloomFilterMessage.setNFlags(100);
    bloomFilterMessage.setNHashFuncs(100);

    const request = new TransactionsWithProofsRequest();

    request.setBloomFilter(bloomFilterMessage);

    call.request = request;

    try {
      await subscribeToTransactionsWithProofsHandler(call);

      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: Invalid bloom filter: '
        + '"nHashFuncs" exceeded max size "50"');

      expect(call.write).to.not.have.been.called();
      expect(call.end).to.not.have.been.called();
    }
  });

  it('should respond with error if both fromBlockHash and fromBlockHeight are not specified', async () => {
    try {
      await subscribeToTransactionsWithProofsHandler(call);
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal(
        'Invalid argument: Either fromBlockHash or fromBlockHeight should be specified',
      );

      expect(call.write).to.not.have.been.called();
      expect(call.end).to.not.have.been.called();
    }
  });

  it('should respond with error if fromBlockHeight exceeded blockchain length', async () => {
    call.request.setFromBlockHeight(100);

    coreAPIMock.getBestBlockHeight.resolves(10);

    try {
      await subscribeToTransactionsWithProofsHandler(call);
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: fromBlockHeight is bigger than block count');

      expect(call.write).to.not.have.been.called();
      expect(call.end).to.not.have.been.called();
    }
  });

  it('should respond with error if requested data length exceeded blockchain length', async () => {
    call.request.setFromBlockHash('someBlockHash');
    call.request.setCount(100);

    coreAPIMock.getBlock.resolves({ height: 1 });
    coreAPIMock.getBestBlockHeight.resolves(10);

    try {
      await subscribeToTransactionsWithProofsHandler(call);
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal(
        'Invalid argument: count is too big, could not fetch more than blockchain length',
      );

      expect(call.write).to.not.have.been.called();
      expect(call.end).to.not.have.been.called();
    }
  });

  it('should subscribe to new transactions if count is not specified', async function it() {
    call.request.setFromBlockHash('someBlockHash');
    call.request.setCount(0);

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

    await subscribeToTransactionsWithProofsHandler(call);

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
      [firstResponse],
    );

    expect(writableStub.getCall(1).args).to.deep.equal(
      [secondResponse],
    );
  });

  it('should end call and emit CLIENT_DISCONNECTED event when client disconnects', async () => {
    call.request.setFromBlockHash('someHash');
    coreAPIMock.getBlock.resolves({ height: 1 });

    await subscribeToTransactionsWithProofsHandler(call);

    // Client disconnects
    call.emit('cancelled');

    // Bloom filters was removed when client disconnects
    expect(ProcessMediator.prototype.emit.getCall(1)).to.be.calledWith(
      ProcessMediator.EVENTS.CLIENT_DISCONNECTED,
    );

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.have.been.calledOnce();
  });
});
