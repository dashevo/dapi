const bs58 = require('bs58');

const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    GetIdentityIdByFirstPublicKeyResponse,
  },
} = require('@dashevo/dapi-grpc');

const getIdentityIdByPublicKeyHashHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/platform/getIdentityIdByPublicKeyHashHandlerFactory',
);

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

const AbciResponseError = require('../../../../../lib/errors/AbciResponseError');

describe('getIdentityIdByPublicKeyHashHandlerFactory', () => {
  let call;
  let driveStateRepositoryMock;
  let handleAbciResponseErrorMock;
  let getIdentityIdByPublicKeyHashHandler;
  let publicKeyHash;
  let id;

  beforeEach(function beforeEach() {
    publicKeyHash = '556c2910d46fda2b327ef9d9bda850cc84d30db0';
    id = '5poV8Vdi27VksX2RAzAgXmjAh14y87JN2zLvyAwmepRK';

    call = new GrpcCallMock(this.sinon, {
      getPublicKeyHash: this.sinon.stub().returns(
        Buffer.from(publicKeyHash, 'hex'),
      ),
    });

    handleAbciResponseErrorMock = this.sinon.stub();

    driveStateRepositoryMock = {
      fetchIdentityIdByFirstPublicKey: this.sinon.stub().resolves(bs58.decode(id)),
    };

    getIdentityIdByPublicKeyHashHandler = getIdentityIdByPublicKeyHashHandlerFactory(
      driveStateRepositoryMock,
      handleAbciResponseErrorMock,
    );
  });

  it('should return valid result', async () => {
    const result = await getIdentityIdByPublicKeyHashHandler(call);

    expect(result).to.be.an.instanceOf(GetIdentityIdByFirstPublicKeyResponse);
    expect(result.getId()).to.equal(id);
    expect(driveStateRepositoryMock.fetchIdentityIdByFirstPublicKey)
      .to.be.calledOnceWith(publicKeyHash);
    expect(handleAbciResponseErrorMock).to.not.be.called();
  });

  it('should throw an InvalidArgumentGrpcError if id is not specified', async () => {
    call.request.getPublicKeyHash.returns(null);

    try {
      await getIdentityIdByPublicKeyHashHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Public key hash is not specified');
      expect(driveStateRepositoryMock.fetchIdentityIdByFirstPublicKey).to.not.be.called();
      expect(handleAbciResponseErrorMock).to.not.be.called();
    }
  });

  it('should throw an error when fetchIdentity throws an AbciResponseError', async () => {
    const code = 2;
    const message = 'Some error';
    const data = 42;
    const abciResponseError = new AbciResponseError(code, { message, data });
    const handleError = new InvalidArgumentGrpcError('Another error');

    driveStateRepositoryMock.fetchIdentityIdByFirstPublicKey.throws(abciResponseError);
    handleAbciResponseErrorMock.throws(handleError);

    try {
      await getIdentityIdByPublicKeyHashHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.equal(handleError);
      expect(driveStateRepositoryMock.fetchIdentityIdByFirstPublicKey)
        .to.be.calledOnceWith(publicKeyHash);
      expect(handleAbciResponseErrorMock).to.be.calledOnceWith(abciResponseError);
    }
  });

  it('should throw an error when fetchIdentity throws unknown error', async () => {
    const error = new Error('Unknown error');

    driveStateRepositoryMock.fetchIdentityIdByFirstPublicKey.throws(error);

    try {
      await getIdentityIdByPublicKeyHashHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.equal(error);
      expect(driveStateRepositoryMock.fetchIdentityIdByFirstPublicKey)
        .to.be.calledOnceWith(publicKeyHash);
      expect(handleAbciResponseErrorMock).to.not.be.called();
    }
  });
});
