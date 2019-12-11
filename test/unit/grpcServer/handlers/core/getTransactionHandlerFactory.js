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
  GetTransactionResponse,
} = require('@dashevo/dapi-grpc');

const getTransactionHandlerFactory = require('../../../../../lib/grpcServer/handlers/core/getTransactionHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

describe('getTransactionHandlerFactory', () => {
  let call;
  let request;
  let id;
  let transaction;
  let getTransactionHandler;
  let insightAPIMock;

  beforeEach(function beforeEach() {
    id = 'id';
    transaction = {
      transaction: 'transaction data',
    };

    request = {
      getId: this.sinon.stub().returns(id),
    };

    call = new GrpcCallMock(this.sinon, request);

    insightAPIMock = {
      getTransactionById: this.sinon.stub().resolves(transaction),
    };

    getTransactionHandler = getTransactionHandlerFactory(insightAPIMock);
  });

  it('should return valid result', async () => {
    const result = await getTransactionHandler(call);

    expect(result).to.be.an.instanceOf(GetTransactionResponse);

    const transactionBinary = result.getTransaction();

    expect(transactionBinary).to.be.an.instanceOf(Buffer);

    const returnedTransaction = cbor.decode(transactionBinary);

    expect(returnedTransaction).to.deep.equal(transaction);

    expect(insightAPIMock.getTransactionById).to.be.calledOnceWith(id);
  });

  it('should throw InvalidArgumentGrpcError error if id is not specified', async () => {
    id = null;
    request.getId.returns(id);

    try {
      await getTransactionHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: id is not specified');
      expect(insightAPIMock.getTransactionById).to.be.not.called();
    }
  });

  it('should throw InternalGrpcError if insightAPI throws an error', async () => {
    const error = new Error('some error');
    insightAPIMock.getTransactionById.throws(error);

    try {
      await getTransactionHandler(call);

      expect.fail('should thrown InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(insightAPIMock.getTransactionById).to.be.calledOnceWith(id);
    }
  });
});
