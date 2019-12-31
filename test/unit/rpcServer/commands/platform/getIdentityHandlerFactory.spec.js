const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const sinon = require('sinon');
const bs58 = require('bs58');

const getIdentityHandlerFactory = require('../../../../../lib/rpcServer/commands/platform/getIdentityHandlerFactory');
const ArgumentsValidationError = require('../../../../../lib/errors/ArgumentsValidationError');

chai.use(dirtyChai);
chai.use(chaiAsPromised);
const { expect } = chai;

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
    const testId = '2UErKUaV3rPBbvjbMdEkjTGNyuVKpdtHQ3KoDyoogzR7';

    const res = await getIdentity({ id: testId });

    expect(res).to.be.deep.equal({ identity: 'identityBase64' });
    expect(tendermintRpcMock.request.calledOnce).to.be.true();
    expect(tendermintRpcMock.request.calledWithExactly('abci_query', {
      path: '/identity',
      data: bs58.decode(testId).toString('hex'),
    })).to.be.true();
  });

  it("Should throw an error if args don't match the arg schema", async () => {
    const getIdentity = getIdentityHandlerFactory(tendermintRpcMock, handleAbciMock);

    await expect(getIdentity(1)).to.be.rejectedWith('params should be object');
    try {
      await getIdentity({ id: '123' });
    } catch (e) {
      expect(e).to.be.instanceOf(ArgumentsValidationError);
      expect(e.message).to.be.equal('params.id should NOT be shorter than 42 characters');
    }
  });
});