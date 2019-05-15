const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');
const { Transaction } = require('@dashevo/dashcore-lib');
const BloomFilter = require('bloom-filter');
const { TransactionFilterResponse } = require('@dashevo/dapi-grpc');

const GrpcCallMock = require('../../../../lib/test/mock/GrpcCallMock');
const BloomFilterEmitterCollection = require('../../../../lib/bloomFilter/emitter/BloomFilterEmitterCollection');
const testTransactionAgainstFilterCollectionFactory = require('../../../../lib/transactionsFilter/testRawTransactionAgainstFilterCollectionFactory');
const emitBlockEventToFilterCollectionFactory = require('../../../../lib/transactionsFilter/emitBlockEventToFilterCollectionFactory');
const testTransactionsAgainstFilter = require('../../../../lib/transactionsFilter/testTransactionAgainstFilter');
const getTransactionsByFilterHandlerFactory = require('../../../../lib/grpcServer/handlers/getTransactionsByFilterHandlerFactory');

use(sinonChai);
use(chaiAsPromised);
use(dirtyChai);

describe('getTransactionsByFilterHandlerFactory', () => {
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
  let getTransactionsByFilterHandler;
  let emitBlockEventToFilterCollection;
  let testRawTransactionAgainstFilterCollection;
  let transaction;

  beforeEach(function beforeEach() {
    const privateKey = 'cSBnVM4xvxarwGQuAfQFwqDg9k5tErHUHzgWsEfD4zdwUasvqRVY';
    const testScript = 'OP_DUP OP_HASH160 20 0x88d9931ea73d60eaf7e5671efc0552b912911f2a OP_EQUALVERIFY OP_CHECKSIG';
    const testPrevTx = 'a477af6b2667c29670467e4e0728b685ee07b240235771862318e29ddbe58458';
    const testAmount = 1020000;
    const toAddress = 'yXGeNPQXYFXhLAN1ZKrAjxzzBnZ2JZNKnh';
    transaction = new Transaction();
    transaction.from({
      txId: testPrevTx,
      outputIndex: 0,
      script: testScript,
      satoshis: testAmount,
    }).to(toAddress, testAmount - 10000)
      .sign(privateKey);

    call = new GrpcCallMock(this.sinon);

    const bloomFilterEmitterCollection = new BloomFilterEmitterCollection();
    emitBlockEventToFilterCollection = emitBlockEventToFilterCollectionFactory(
      bloomFilterEmitterCollection,
    );
    testRawTransactionAgainstFilterCollection = testTransactionAgainstFilterCollectionFactory(
      bloomFilterEmitterCollection,
    );

    getTransactionsByFilterHandler = getTransactionsByFilterHandlerFactory(
      bloomFilterEmitterCollection,
      testTransactionsAgainstFilter,
    );
  });

  it('should send a matched raw transaction when it appears', () => {
    // Create bloom filter with transaction hash
    const bloomFilter = BloomFilter.create(1, 0.01);

    const binaryTransactionHash = Buffer.from(transaction.hash, 'hex');

    bloomFilter.insert(binaryTransactionHash);

    call.request = bloomFilter.toObject();

    // Get bloom filter from client
    getTransactionsByFilterHandler(call);

    // Call listener when new transaction appears
    testRawTransactionAgainstFilterCollection(transaction.serialize());

    const expectedResponse = new TransactionFilterResponse();
    expectedResponse.setRawTransaction(transaction.toBuffer());

    expect(call.write).to.have.been.calledOnceWith(expectedResponse.toObject());
    expect(call.end).to.not.have.been.called();
  });

  it('should not send a not matched raw transaction when it appears', () => {
    // Create empty bloom filter
    const bloomFilter = BloomFilter.create(1, 0.01);

    call.request = bloomFilter.toObject();

    // Get bloom filter from client
    getTransactionsByFilterHandler(call);

    // Call listener when new transaction appears
    testRawTransactionAgainstFilterCollection(transaction.serialize());

    const expectedResponse = new TransactionFilterResponse();
    expectedResponse.setRawTransaction(transaction.toBuffer());

    expect(call.write).to.not.have.been.called();
    expect(call.end).to.not.have.been.called();
  });

  it('should send a merkle block with sent matched transactions when new block is mined');
  it('should not send a merkle block if it doesn\'t contain sent matched transactions');
  it('should not send a merkle block if there is no matched transactions');
  it('should end call and remove the bloom filter emitter from the collection when client disconnects');
});
