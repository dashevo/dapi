const { expect } = require('chai');

const sinon = require('sinon');

const applyStateTransitionHandlerFactory = require('../../../../../lib/rpcServer/commands/platform/applyStateTransitionHandlerFactory');
const Validator = require('../../../../../lib/utils/Validator');
const argsSchema = require('../../../../../lib/rpcServer/commands/platform/schemas/applyStateTransition');

describe('applyStateTransitionHandlerFactory', () => {
  let tendermintRpcMock;
  let handleAbciMock;
  let validator;

  beforeEach(() => {
    tendermintRpcMock = {
      request: sinon.stub().returns({ result: { check_tx: '1', deliver_tx: '2' }, error: null }),
    };
    validator = new Validator(argsSchema);

    handleAbciMock = sinon.stub();
  });

  it('should call the right method with the correct args', async () => {
    const getIdentity = applyStateTransitionHandlerFactory(
      tendermintRpcMock, handleAbciMock, validator,
    );
    const st = 'MC4yMTU1ODUyOTQxMTAxMzgzOA==';

    const res = await getIdentity({ stateTransition: st });

    expect(res).to.be.equal(true);
    expect(tendermintRpcMock.request.calledOnce).to.be.true();
    expect(tendermintRpcMock.request.calledWithExactly('broadcast_tx_commit', { tx: st })).to.be.true();
  });
});
