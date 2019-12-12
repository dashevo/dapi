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
  GetDataContractResponse,
} = require('@dashevo/dapi-grpc');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

const getDataContractHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/platform/getDataContractHandlerFactory',
);

describe('getDataContractHandlerFactory', () => {
  let call;
  let getDataContractHandler;
  let driveApiMock;
  let request;
  let id;
  let contractFixture;

  beforeEach(function beforeEach() {
    id = 1;
    request = {
      getId: this.sinon.stub().returns(id),
    };

    call = new GrpcCallMock(this.sinon, request);

    contractFixture = {
      data: 'someData',
    };

    driveApiMock = {
      fetchContract: this.sinon.stub().resolves(contractFixture),
    };

    getDataContractHandler = getDataContractHandlerFactory(driveApiMock);
  });

  it('should return valid data', async () => {
    const result = await getDataContractHandler(call);

    expect(result).to.be.an.instanceOf(GetDataContractResponse);

    const contractBinary = result.getDataContract();
    expect(contractBinary).to.be.an.instanceOf(Buffer);

    const returnedContract = cbor.decode(contractBinary);
    expect(returnedContract).to.deep.equal(contractFixture);
  });

  it('should throw InvalidArgumentGrpcError error if id is not specified', async () => {
    id = null;
    request.getId.returns(id);

    try {
      await getDataContractHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: id is not specified');
      expect(driveApiMock.fetchContract).to.be.not.called();
    }
  });

  it('should throw InternalGrpcError if driveAPI throws an error', async () => {
    const error = new Error('some error');
    driveApiMock.fetchContract.throws(error);

    try {
      await getDataContractHandler(call);

      expect.fail('should thrown InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(driveApiMock.fetchContract).to.be.calledOnceWith(id);
    }
  });
});
