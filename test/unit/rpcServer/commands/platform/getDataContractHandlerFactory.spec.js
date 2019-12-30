const { expect } = require('chai');

const sinon = require('sinon');

const getIdentityHandlerFactory = require('../../../../../lib/rpcServer/commands/platform/getDataContractHandlerFactory');

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
    const getIdentity = getIdentityHandlerFactory(driveAdapterMock, dppMock);
    const testId = '123';

    const res = await getIdentity({ id: testId });

    expect(res).to.be.deep.equal({ dataContract: '/w==' });
    expect(driveAdapterMock.fetchContract.calledOnce).to.be.true;
    expect(driveAdapterMock.fetchContract.calledWithExactly(testId)).to.be.true;
  });
});
