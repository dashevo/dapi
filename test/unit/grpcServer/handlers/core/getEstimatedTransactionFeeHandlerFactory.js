const {
  server: {
    error: {
      InternalGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  GetEstimatedTransactionFeeResponse,
} = require('@dashevo/dapi-grpc');

const getEstimatedTransactionFeeHandlerFactory = require('../../../../../lib/grpcServer/handlers/core/getEstimatedTransactionFeeHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

describe('getEstimatedTransactionFeeHandlerFactory', () => {
  let call;
  let insightAPIMock;
  let request;
  let getEstimatedTransactionFeeHandler;
  let fee;
  let blocks;

  beforeEach(function beforeEach() {
    fee = 0.5;
    blocks = null;
    request = {
      getBlocks: this.sinon.stub().returns(blocks),
    };

    call = new GrpcCallMock(this.sinon, request);

    insightAPIMock = {
      estimateFee: this.sinon.stub().resolves(fee),
    };

    getEstimatedTransactionFeeHandler = getEstimatedTransactionFeeHandlerFactory(insightAPIMock);
  });

  it('should return valid result is number of blocks is not specified', async () => {
    const result = await getEstimatedTransactionFeeHandler(call);

    expect(result).to.be.an.instanceOf(GetEstimatedTransactionFeeResponse);
    expect(insightAPIMock.estimateFee).to.be.calledOnceWith(3);

    const returnedFee = result.getFee();

    expect(returnedFee).to.equal(fee);
  });

  it('should return valid result is number of blocks is specified', async () => {
    blocks = 4;
    request.getBlocks.returns(blocks);

    const result = await getEstimatedTransactionFeeHandler(call);

    expect(result).to.be.an.instanceOf(GetEstimatedTransactionFeeResponse);
    expect(insightAPIMock.estimateFee).to.be.calledOnceWith(blocks);

    const returnedFee = result.getFee();

    expect(returnedFee).to.equal(fee);
  });

  it('should throw InternalGrpcError if insightAPI throws an error', async () => {
    const error = new Error('some error');
    insightAPIMock.estimateFee.throws(error);

    blocks = 4;
    request.getBlocks.returns(blocks);

    try {
      await getEstimatedTransactionFeeHandler(call);

      expect.fail('should thrown InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(insightAPIMock.estimateFee).to.be.calledOnceWith(blocks);
    }
  });
});
