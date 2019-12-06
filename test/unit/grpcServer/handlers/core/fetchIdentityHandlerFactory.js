const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  FetchIdentityResponse,
} = require('@dashevo/dapi-grpc');

const fetchIdentityHandlerFactory = require('../../../../../lib/grpcServer/handlers/core/fetchIdentityHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

describe('fetchIdentityHandlerFactory', () => {
  let call;
  let rpcClientMock;
  let id;
  let handleResponseMock;
  let fetchIdentityHandler;
  let response;
  let rpcResponse;
  let hexId;

  beforeEach(function beforeEach() {
    id = '5poV8Vdi27VksX2RAzAgXmjAh14y87JN2zLvyAwmepRK';
    call = new GrpcCallMock(this.sinon, {
      getId: this.sinon.stub().returns(id),
    });

    handleResponseMock = this.sinon.stub();

    const code = 0;

    const log = JSON.stringify({
      error: {
        message: 'some message',
        data: {
          error: 'some data',
        },
      },
    });

    const value = Buffer.from('value');

    response = {
      value,
      log,
      code,
    };

    rpcResponse = {
      id: '',
      jsonrpc: '2.0',
      error: '',
      result: {
        response,
      },
    };

    hexId = Buffer.from(id).toString('hex');

    rpcClientMock = {
      request: this.sinon.stub().resolves(rpcResponse),
    };

    fetchIdentityHandler = fetchIdentityHandlerFactory(rpcClientMock, handleResponseMock);
  });

  it('should return valid result', async () => {
    const result = await fetchIdentityHandler(call);

    expect(result).to.be.an.instanceOf(FetchIdentityResponse);

    expect(rpcClientMock.request).to.be.calledOnceWith('abci_query', { path: '/identity', data: hexId });
    expect(handleResponseMock).to.be.calledOnceWith(response);
  });

  it('should throw an InvalidArgumentGrpcError if id is not specified', async () => {
    call.getId().returns(null);

    try {
      await fetchIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.be.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: id is not specified');
      expect(rpcClientMock.request).to.not.be.called();
      expect(handleResponseMock).to.not.be.called();
    }
  });

  it('should throw InternalGrpcError if rpcClient thrown an error', async () => {
    const error = new Error();

    rpcClientMock.request.throws(error);

    try {
      await fetchIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(rpcClientMock.request).to.be.calledOnceWith('abci_query', { path: '/identity', data: hexId });
      expect(handleResponseMock).to.not.be.called();
    }
  });

  it('should throw InternalGrpcError if rpcClient returns an error', async () => {
    const error = new Error();
    rpcResponse.error = error;

    try {
      await fetchIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.be.instanceOf(InternalGrpcError);
      expect(e.getError()).to.equal(error);
      expect(rpcClientMock.request).to.be.calledOnceWith('abci_query', { path: '/identity', data: hexId });
      expect(handleResponseMock).to.not.be.called();
    }
  });

  it('should throw an error when handleResponse throws an error', async () => {
    const error = new Error();
    handleResponseMock.throws(error);

    try {
      await fetchIdentityHandler(call);

      expect.fail('should throw an error');
    } catch (e) {
      expect(e).to.equal(error);
      expect(handleResponseMock).to.be.calledOnceWith(response);
    }
  });
});
