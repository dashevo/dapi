const { expect } = require('chai');

const sinon = require('sinon');

const applyStateTransitionHandlerFactory = require('../../../../../lib/rpcServer/commands/platform/applyStateTransitionHandlerFactory');


describe('applyStateTransitionHandlerFactory', () => {
  let tendermintRpcMock;
  let handleAbciMock;

  beforeEach(() => {
    tendermintRpcMock = {
      request: sinon.stub().returns({ result: { check_tx: '1', deliver_tx: '2' }, error: null }),
    };

    handleAbciMock = sinon.stub();
  });

  it('Should call the right method with the correct args', async () => {
    const getIdentity = applyStateTransitionHandlerFactory(tendermintRpcMock, handleAbciMock);
    const st = 'MC4yMTU1ODUyOTQxMTAxMzgzOA==';

    const res = await getIdentity({ stateTransition: st });

    expect(res).to.be.equal(true);
    expect(tendermintRpcMock.request.calledOnce).to.be.true;
    expect(tendermintRpcMock.request.calledWithExactly('/broadcast_tx_commit', { tx: st })).to.be.true;
  });
});
