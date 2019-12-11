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
  GetBlockResponse,
} = require('@dashevo/dapi-grpc');

const getBlockHandlerFactory = require('../../../../../lib/grpcServer/handlers/core/getBlockHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

describe('getBlockHandlerFactory', () => {
  let call;
  let hash;
  let height;
  let block;
  let getBlockHandler;
  let insightAPIMock;
  let request;

  beforeEach(function beforeEach() {
    hash = '';
    height = 0;

    block = {
      data: 'blockData',
    };

    request = {
      getHeight: this.sinon.stub().returns(height),
      getHash: this.sinon.stub().returns(hash),
    };

    call = new GrpcCallMock(this.sinon, request);

    insightAPIMock = {
      getBlockByHash: this.sinon.stub().resolves(block),
      getBlockByHeight: this.sinon.stub().resolves(block),
    };

    getBlockHandler = getBlockHandlerFactory(insightAPIMock);
  });

  it('should return valid result is hash is specified', async () => {
    hash = 'hash';
    request.getHash.returns(hash);

    const result = await getBlockHandler(call);

    expect(result).to.be.an.instanceOf(GetBlockResponse);

    expect(insightAPIMock.getBlockByHash).to.be.calledOnceWith(hash);
    expect(insightAPIMock.getBlockByHeight).to.be.not.called();

    const blockBinary = result.getBlock();

    expect(blockBinary).to.be.an.instanceOf(Buffer);

    const returnedBlock = cbor.decode(blockBinary);

    expect(returnedBlock).to.deep.equal(returnedBlock);
  });

  it('should return valid result is height is specified', async () => {
    height = 42;
    request.getHeight.returns(height);

    const result = await getBlockHandler(call);

    expect(result).to.be.an.instanceOf(GetBlockResponse);

    expect(insightAPIMock.getBlockByHash).to.be.not.called();
    expect(insightAPIMock.getBlockByHeight).to.be.calledOnceWith(height);

    const blockBinary = result.getBlock();

    expect(blockBinary).to.be.an.instanceOf(Buffer);

    const returnedBlock = cbor.decode(blockBinary);

    expect(returnedBlock).to.deep.equal(returnedBlock);
  });

  it('should throw an InvalidArgumentGrpcError if hash and height are not specified', async () => {
    try {
      await getBlockHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: hash or height is not specified');
      expect(insightAPIMock.getBlockByHash).to.be.not.called();
      expect(insightAPIMock.getBlockByHeight).to.be.not.called();
    }
  });

  it('should throw InternalGrpcError if insightAPI throws an error', async () => {
    const error = new Error('some error');
    insightAPIMock.getBlockByHeight.throws(error);
    height = 42;
    request.getHeight.returns(height);

    try {
      await getBlockHandler(call);

      expect.fail('should thrown InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(insightAPIMock.getBlockByHash).to.be.not.called();
      expect(insightAPIMock.getBlockByHeight).to.be.calledOnceWith(height);
    }
  });
});
