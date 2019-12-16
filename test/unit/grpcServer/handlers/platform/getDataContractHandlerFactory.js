const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  GetDataContractResponse,
} = require('@dashevo/dapi-grpc');

const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const getDataContractFixture = require('@dashevo/dpp/lib/test/fixtures/getDataContractFixture');

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
  let dataContractFixture;
  let dppMock;

  beforeEach(function beforeEach() {
    id = 1;
    request = {
      getId: this.sinon.stub().returns(id),
    };

    call = new GrpcCallMock(this.sinon, request);

    dataContractFixture = getDataContractFixture();

    driveApiMock = {
      fetchContract: this.sinon.stub().resolves(dataContractFixture.toJSON()),
    };

    dppMock = createDPPMock(this.sinon);
    dppMock.dataContract.createFromObject.returns(dataContractFixture);

    getDataContractHandler = getDataContractHandlerFactory(driveApiMock, dppMock);
  });

  it('should return valid data', async () => {
    const result = await getDataContractHandler(call);

    expect(result).to.be.an.instanceOf(GetDataContractResponse);

    const contractBinary = result.getDataContract();
    expect(contractBinary).to.be.an.instanceOf(Buffer);

    expect(dppMock.dataContract.createFromObject).to.be.calledOnceWith(
      dataContractFixture.toJSON(),
    );

    expect(contractBinary).to.deep.equal(dataContractFixture.serialize());
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
      expect(dppMock.dataContract.createFromObject).to.be.not.called();
    }
  });
});
