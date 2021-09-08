const GrpcErrorCodes = require('@dashevo/grpc-common/lib/server/error/GrpcErrorCodes');
const GrpcError = require('@dashevo/grpc-common/lib/server/error/GrpcError');
const cbor = require('cbor');
const AbstractConsensusError = require('@dashevo/dpp/lib/errors/consensus/AbstractConsensusError');
const InternalGrpcError = require('@dashevo/grpc-common/lib/server/error/InternalGrpcError');
const createGrpcErrorFromDriveResponse = require(
  '../../../../lib/grpcServer/handlers/createGrpcErrorFromDriveResponse',
);

describe('createGrpcErrorFromDriveResponse', () => {
  let message;
  let metadata;

  beforeEach(() => {
    message = 'message';
    metadata = cbor.encode({
      message,
      metadata: {
        error: 'some data',
      },
    }).toString('base64');
  });

  Object.entries(GrpcErrorCodes)
    .forEach(([codeClass, code]) => {
      it(`should throw ${codeClass} if response code is ${code}`, () => {
        try {
          createGrpcErrorFromDriveResponse(code, metadata);
        } catch (e) {
          expect(e).to.be.an.instanceOf(GrpcError);
          expect(e.getMessage()).to.equal(message);
          expect(e.getCode()).to.equal(code);
        }
      });
    });

  it('should throw GrpcError if error code = 17', () => {
    try {
      createGrpcErrorFromDriveResponse(17, metadata);
    } catch (e) {
      expect(e).to.be.an.instanceOf(GrpcError);
      expect(e.getMessage()).to.equal(message);
      expect(e.getCode()).to.equal(17);
    }
  });

  it('should throw GrpcError if error code = 99', () => {
    try {
      createGrpcErrorFromDriveResponse(99, metadata);
    } catch (e) {
      expect(e).to.be.an.instanceOf(GrpcError);
      expect(e.getMessage()).to.equal(message);
      expect(e.getCode()).to.equal(99);
    }
  });

  it('should throw ConsensusError if error code = 1000', () => {
    try {
      createGrpcErrorFromDriveResponse(1000, cbor.encode([42, 'a']).toString('base64'));
    } catch (e) {
      expect(e).to.be.an.instanceOf(AbstractConsensusError);
      expect(e.getMessage()).to.equal(message);
      expect(e.getCode()).to.equal(1000);
    }
  });

  it('should throw Unknown error code >= 5000', () => {
    try {
      createGrpcErrorFromDriveResponse(5000, metadata);
    } catch (e) {
      expect(e).to.be.an.instanceOf(GrpcError);
      expect(e.getMessage()).to.equal('Unknown error code: 5000');
      expect(e.getCode()).to.equal(5000);
    }
  });


  it('should return InternalGrpcError if codes is undefined', async () => {
    try {
      createGrpcErrorFromDriveResponse();
    } catch (e) {
      expect(e).to.be.an.instanceOf(InternalGrpcError);
      expect(e.getMessage()).to.equal('Drive’s error code is empty');
    }
  });
});
