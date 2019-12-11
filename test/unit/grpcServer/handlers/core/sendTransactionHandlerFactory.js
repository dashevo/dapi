const cbor = require('cbor');

const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  SendTransactionResponse,
} = require('@dashevo/dapi-grpc');

const sendTransactionHandlerFactory = require('../../../../../lib/grpcServer/handlers/core/sendTransactionHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

describe('sendTransactionHandlerFactory', () => {
  let call;
  let insightAPIMock;
  let request;
  let rawTransaction;
  let transactionId;
  let sendTransactionHandler;

  beforeEach(function beforeEach() {
    rawTransaction = '0300000001086a3640a4a88a85d5720ecb69a93d0aef1cfa759d1242835e4abaf4168b924d000000006b483045022100ed608a9742913c94e057798297a6a96ed40c41dc61209e6887df51ea5755234802207f5733ef592f3df59bc6d39749ac5f1a771b32263ce16982b1aacc80ff1358cd012103323aa9dd83ba005b1b1e61b36cba27c2e0f64bacb57c34243fc7ef2751fff6edffffffff021027000000000000166a1481b21f3898087a0d1905140c7db8d7db00acd13954a09a3b000000001976a91481b21f3898087a0d1905140c7db8d7db00acd13988ac00000000';

    transactionId = 'id';

    request = {
      getTransaction: this.sinon.stub().returns(cbor.encodeCanonical(rawTransaction)),
    };

    call = new GrpcCallMock(this.sinon, request);

    insightAPIMock = {
      sendTransaction: this.sinon.stub().resolves(transactionId),
    };

    sendTransactionHandler = sendTransactionHandlerFactory(insightAPIMock);
  });

  it('should return valid result', async () => {
    const result = await sendTransactionHandler(call);

    expect(result).to.be.an.instanceOf(SendTransactionResponse);
    expect(result.getTransactionId()).to.equal(transactionId);
    expect(insightAPIMock.sendTransaction).to.be.calledOnceWith(rawTransaction);
  });

  it('should throw InvalidArgumentGrpcError error if transaction is not specified', async () => {
    rawTransaction = null;
    request.getTransaction.returns(rawTransaction);

    try {
      await sendTransactionHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: transaction is not specified');
      expect(insightAPIMock.sendTransaction).to.be.not.called();
    }
  });

  it('should throw InvalidArgumentGrpcError error if transaction is not valid', async () => {
    rawTransaction = '03000000011846a52a9e766cbb0a6153bb78af9858cc71070aea44cd8282ba8e5c5de7331b000000006a4730440220267c9903049b8962f67ed7809e0f5cf32324d999b7a85c9d883298600bb880ab022048478303e2281e26cefa496e7b3aeac0c5cccbe6e0429adf8532438f996c4a0c012103fe92ef7d837791caaf44be835a1782b4b1f0865c4c6ae73a4a92b14c8a37cc78ffffffff0000000000';
    request.getTransaction.returns(cbor.encodeCanonical(rawTransaction));

    try {
      await sendTransactionHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: invalid transaction: transaction txouts empty');
      expect(insightAPIMock.sendTransaction).to.be.not.called();
    }
  });

  it('should throw InvalidArgumentGrpcError error if transaction cannot be decoded', async () => {
    rawTransaction = 'invalid data';
    request.getTransaction.returns(cbor.encodeCanonical(rawTransaction));

    try {
      await sendTransactionHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: invalid transaction: Invalid Argument: Must provide an object or string to deserialize a transaction');
      expect(insightAPIMock.sendTransaction).to.be.not.called();
    }
  });

  it('should throw InternalGrpcError if insightAPI throws an error', async () => {
    const error = new Error('some error');
    insightAPIMock.sendTransaction.throws(error);

    try {
      await sendTransactionHandler(call);

      expect.fail('should thrown InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(insightAPIMock.sendTransaction).to.be.calledOnceWith(rawTransaction);
    }
  });
});
