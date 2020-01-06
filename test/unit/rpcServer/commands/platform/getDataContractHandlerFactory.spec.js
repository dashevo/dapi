const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const sinon = require('sinon');

const ArgumentsValidationError = require('../../../../../lib/errors/ArgumentsValidationError');

chai.use(dirtyChai);
chai.use(chaiAsPromised);
const { expect } = chai;

const getDataContractHandlerFactory = require('../../../../../lib/rpcServer/commands/platform/getDataContractHandlerFactory');

describe('getDataContractHandlerFactory', () => {
  let driveAdapterMock;
  let dppMock;

  beforeEach(() => {
    driveAdapterMock = {
      fetchContract: sinon.stub(),
    };
    dppMock = {
      dataContract: {
        createFromObject: sinon.stub().returns({ serialize() { return Buffer.from('ff', 'hex'); } }),
      },
    };
  });

  it('Should call the right method with the correct args', async () => {
    const getIdentity = getDataContractHandlerFactory(driveAdapterMock, dppMock);
    const testId = '2UErKUaV3rPBbvjbMdEkjTGNyuVKpdtHQ3KoDyoogzR7';

    const res = await getIdentity({ id: testId });

    expect(res).to.be.deep.equal({ dataContract: '/w==' });
    expect(driveAdapterMock.fetchContract.calledOnce).to.be.true();
    expect(driveAdapterMock.fetchContract.calledWithExactly(testId)).to.be.true();
  });

  it("Should throw an error if args don't match the arg schema", async () => {
    const getIdentity = getDataContractHandlerFactory(driveAdapterMock, dppMock);

    await expect(getIdentity(1)).to.be.rejectedWith('params should be object');
    try {
      await getIdentity({ id: '123' });
    } catch (e) {
      expect(e).to.be.instanceOf(ArgumentsValidationError);
      expect(e.message).to.be.equal('params.id should NOT be shorter than 42 characters');
    }
  });
});
