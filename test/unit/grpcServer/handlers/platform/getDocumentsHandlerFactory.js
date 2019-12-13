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
  GetDocumentsResponse,
} = require('@dashevo/dapi-grpc');

const createDPPMock = require('@dashevo/dpp/lib/test/mocks/createDPPMock');

const getDocumentsFixture = require('@dashevo/dpp/lib/test/fixtures/getDocumentsFixture');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

const getDocumentsHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/platform/getDocumentsHandlerFactory',
);


describe('getDocumentsHandlerFactory', () => {
  let call;
  let getDocumentsHandler;
  let driveApiMock;
  let request;
  let documentsFixture;
  let dataContractId;
  let documentType;
  let where;
  let orderBy;
  let limit;
  let startAfter;
  let startAt;
  let options;
  let dppMock;
  let documentsJSONFixture;

  beforeEach(function beforeEach() {
    dataContractId = 'contractId';
    documentType = 'document';
    where = [['name', '==', 'John']];
    orderBy = [{ order: 'asc' }];
    limit = 20;
    startAfter = 1;
    startAt = null;

    request = {
      getDataContractId: this.sinon.stub().returns(dataContractId),
      getDocumentType: this.sinon.stub().returns(documentType),
      getWhere: this.sinon.stub().returns(cbor.encodeCanonical(where)),
      getOrderBy: this.sinon.stub().returns(cbor.encodeCanonical(orderBy)),
      getLimit: this.sinon.stub().returns(limit),
      getStartAfter: this.sinon.stub().returns(startAfter),
      getStartAt: this.sinon.stub().returns(startAt),
    };

    options = {
      where,
      orderBy,
      limit,
      startAfter,
      startAt,
    };

    call = new GrpcCallMock(this.sinon, request);

    const [document] = getDocumentsFixture();

    documentsFixture = [document];

    documentsJSONFixture = documentsFixture.map(document => document.toJSON());

    driveApiMock = {
      fetchDocuments: this.sinon.stub().resolves(documentsJSONFixture),
    };

    dppMock = createDPPMock(this.sinon);
    dppMock.document.createFromObject.returns(document);

    getDocumentsHandler = getDocumentsHandlerFactory(driveApiMock, dppMock);
  });

  it('should return valid result', async () => {
    const result = await getDocumentsHandler(call);

    expect(result).to.be.an.instanceOf(GetDocumentsResponse);

    const documentsBinary = result.getDocumentsList();
    expect(documentsBinary).to.be.an('array');
    expect(documentsBinary).to.have.lengthOf(documentsFixture.length);

    expect(dppMock.document.createFromObject).to.be.calledOnceWith(
      documentsJSONFixture[0],
    );

    expect(driveApiMock.fetchDocuments).to.be.calledOnceWith(dataContractId, documentType, options);

    expect(documentsBinary[0]).to.deep.equal(documentsFixture[0].serialize());
  });

  it('should throw InvalidArgumentGrpcError if dataContractId is not specified', async () => {
    dataContractId = null;
    request.getDataContractId.returns(dataContractId);

    try {
      await getDocumentsHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: dataContractId is not specified');
      expect(driveApiMock.fetchDocuments).to.be.not.called();
      expect(dppMock.document.createFromObject).to.be.not.called();
    }
  });

  it('should throw InvalidArgumentGrpcError if documentType is not specified', async () => {
    documentType = null;
    request.getDocumentType.returns(documentType);

    try {
      await getDocumentsHandler(call);

      expect.fail('should thrown InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: documentType is not specified');
      expect(driveApiMock.fetchDocuments).to.be.not.called();
      expect(dppMock.document.createFromObject).to.be.not.called();
    }
  });

  it('should throw InternalGrpcError if driveAPI throws an error', async () => {
    const error = new Error('some error');
    driveApiMock.fetchDocuments.throws(error);

    try {
      await getDocumentsHandler(call);

      expect.fail('should thrown InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(driveApiMock.fetchDocuments).to.be.calledOnceWith(
        dataContractId,
        documentType,
        options,
      );
      expect(dppMock.document.createFromObject).to.be.not.called();
    }
  });
});
