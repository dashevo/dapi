const { expect } = require('chai');

const sinon = require('sinon');

const getIdentityHandlerFactory = require('../../../../../lib/rpcServer/commands/platform/getIdentityHandlerFactory');


describe('getIdentityHandlerFactory', () => {
  let tendermintRpcMock;
  let handleAbciMock;

  beforeEach(() => {
    tendermintRpcMock = {
      request: sinon.stub().returns({ result: { response: { value: 'identityBase64' } }, error: null }),
    };

    handleAbciMock = sinon.stub();
  });

  it('Should call the right method with the correct args', async () => {
    const getIdentity = getIdentityHandlerFactory(tendermintRpcMock, handleAbciMock);
    const testId = '123';

    const res = await getIdentity({ id: testId });

    expect(res).to.be.deep.equal({ identity: 'identityBase64' });
    expect(tendermintRpcMock.request.calledOnce).to.be.true;
    expect(tendermintRpcMock.request.calledWithExactly('/identity', { id: '123' })).to.be.true;
  });
});
