const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const handleAbciResponseError = require('../../../../lib/grpcServer/handlers/handleAbciResponseError');

describe('handleAbciResponseError', () => {
  let response;
  let message;
  let data;

  beforeEach(() => {
    message = 'message';
    data = { error: 'some data' };

    response = {
      code: 0,
      log: JSON.stringify({
        error: {
          message,
          data,
        },
      }),
    };
  });

  it('should not throw error if response code is 0', () => {
    try {
      handleAbciResponseError(response);
    } catch (e) {
      expect.fail('should not throw any error');
    }
  });

  it('should throw InvalidArgumentGrpcError if response code is 2 (invalid argument)', () => {
    response.code = 2;

    try {
      handleAbciResponseError(response);

      expect.fail('should throw InvalidArgumentGrpcError error');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal(message);
      expect(e.getMetadata()).to.deep.equal(data);
    }
  });

  it('should throw InternalGrpcError if response code is 1 (internal error)', () => {
    response.code = 1;

    try {
      handleAbciResponseError(response);

      expect.fail('should throw InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InternalGrpcError);
      expect(e.getMessage()).to.equal('Internal error');
      expect(e.getMetadata()).to.deep.equal(data);
      expect(e.getError()).to.be.an.instanceOf(Error);
      expect(e.getError().message).to.equal(message);
    }
  });

  it('should should throw InternalGrpcError if response code is unknown', () => {
    response.code = 'a';

    try {
      handleAbciResponseError(response);

      expect.fail('should throw InternalGrpcError error');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InternalGrpcError);
      expect(e.getMessage()).to.equal('Internal error');
      expect(e.getMetadata()).to.deep.equal(data);
      expect(e.getError()).to.be.an.instanceOf(Error);
      expect(e.getError().message).to.equal(message);
    }
  });
});
