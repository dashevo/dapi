const { expect, should } = require('chai');
const sion = require('sinon');
const getAddressTotalReceivedFactory = require('../../../lib/rpcServer/commands/getAddressTotalReceived');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const spy = sion.spy(coreAPIFixture, 'getAddressTotalReceived');
should();

describe('getAddressTotalReceived', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getAddressTotalReceived = getAddressTotalReceivedFactory(coreAPIFixture);
      expect(getAddressTotalReceived).to.be.a('function');
    });
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  it('Should return a number', async () => {
    const getAddressTotalReceived = getAddressTotalReceivedFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    let summary = await getAddressTotalReceived(['XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w']);
    expect(summary).to.be.an('number');
    expect(spy.callCount).to.be.equal(1);
    summary = await getAddressTotalReceived({ address: 'XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w' });
    expect(summary).to.be.an('number');
    expect(spy.callCount).to.be.equal(2);
  });

  it('Should throw if arguments are not valid', async () => {
    const getAddressTotalReceived = getAddressTotalReceivedFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressTotalReceived([])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressTotalReceived({})).to.be.rejectedWith('should have required property \'address\'');
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressTotalReceived({ address: 1 })).to.be.rejectedWith('address should be string');
    expect(spy.callCount).to.be.equal(0);
  });
});
