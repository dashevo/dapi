const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    GetIdentityResponse,
    Proof,
  },
} = require('@dashevo/dapi-grpc');

/* eslint-disable import/no-extraneous-dependencies */
const generateRandomIdentifier = require('@dashevo/dpp/lib/test/utils/generateRandomIdentifier');
const getIdentityFixture = require('@dashevo/dpp/lib/test/fixtures/getIdentityFixture');

const getIdentityHandlerFactory = require('../../../../../lib/grpcServer/handlers/platform/getIdentityHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

const AbciResponseError = require('../../../../../lib/errors/AbciResponseError');


describe('getIdentityHandlerFactory', () => {
  let call;
  let driveStateRepositoryMock;
  let id;
  let handleAbciResponseErrorMock;
  let getIdentityHandler;
  let identity;
  let proofFixture;
  let proofMock;
  let response;

  beforeEach(function beforeEach() {
    id = generateRandomIdentifier();
    call = new GrpcCallMock(this.sinon, {
      getId: this.sinon.stub().returns(id),
      getProve: this.sinon.stub().returns(false),
    });

    identity = getIdentityFixture();

    proofFixture = {
      rootTreeProof: Buffer.alloc(1, 1),
      storeTreeProof: Buffer.alloc(1, 2),
    };

    proofMock = new Proof();
    proofMock.setRootTreeProof(proofFixture.rootTreeProof);
    proofMock.setStoreTreeProof(proofFixture.storeTreeProof);

    response = new GetIdentityResponse();
    response.setProof(proofMock);
    response.setIdentity(identity.toBuffer());

    handleAbciResponseErrorMock = this.sinon.stub();

    driveStateRepositoryMock = {
      fetchIdentity: this.sinon.stub().resolves(response.serializeBinary()),
    };

    getIdentityHandler = getIdentityHandlerFactory(
      driveStateRepositoryMock,
      handleAbciResponseErrorMock,
    );
  });

  it('should return valid result', async () => {
    response.setProof(null);
    driveStateRepositoryMock.fetchIdentity.resolves(response.serializeBinary());

    const result = await getIdentityHandler(call);

    expect(result).to.be.an.instanceOf(GetIdentityResponse);
    expect(result.getIdentity()).to.deep.equal(identity.toBuffer());
    expect(driveStateRepositoryMock.fetchIdentity).to.be.calledOnceWith(id, false);
    expect(handleAbciResponseErrorMock).to.not.be.called();

    const proof = result.getProof();
    expect(proof).to.be.undefined();
  });

  it('should return proof', async () => {
    call.request.getProve.returns(true);

    const result = await getIdentityHandler(call);

    expect(result).to.be.an.instanceOf(GetIdentityResponse);

    const proof = result.getProof();

    expect(proof).to.be.an.instanceOf(Proof);
    const rootTreeProof = proof.getRootTreeProof();
    const storeTreeProof = proof.getStoreTreeProof();

    expect(rootTreeProof).to.deep.equal(proofFixture.rootTreeProof);
    expect(storeTreeProof).to.deep.equal(proofFixture.storeTreeProof);

    expect(driveStateRepositoryMock.fetchIdentity).to.be.calledOnceWith(id, true);
  });

  it('should throw an InvalidArgumentGrpcError if id is not specified', async () => {
    call.request.getId.returns(null);

    try {
      await getIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('id is not specified');
      expect(driveStateRepositoryMock.fetchIdentity).to.not.be.called();
      expect(handleAbciResponseErrorMock).to.not.be.called();
    }
  });

  it('should throw an error when fetchIdentity throws an AbciResponseError', async () => {
    const code = 2;
    const message = 'Some error';
    const data = 42;
    const abciResponseError = new AbciResponseError(code, { message, data });
    const handleError = new InvalidArgumentGrpcError('Another error');

    driveStateRepositoryMock.fetchIdentity.throws(abciResponseError);
    handleAbciResponseErrorMock.throws(handleError);

    try {
      await getIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.equal(handleError);
      expect(driveStateRepositoryMock.fetchIdentity).to.be.calledOnceWith(id);
      expect(handleAbciResponseErrorMock).to.be.calledOnceWith(abciResponseError);
    }
  });

  it('should throw an error when fetchIdentity throws unknown error', async () => {
    const error = new Error('Unknown error');

    driveStateRepositoryMock.fetchIdentity.throws(error);

    try {
      await getIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.equal(error);
      expect(driveStateRepositoryMock.fetchIdentity).to.be.calledOnceWith(id);
      expect(handleAbciResponseErrorMock).to.not.be.called();
    }
  });
});
