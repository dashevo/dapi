const { expect, should } = require('chai');
const sion = require('sinon');
const getAddressTotalSentFactory = require('../../../lib/rpcServer/commands/getAddressTotalSent');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const spy = sion.spy(coreAPIFixture, 'getAddressTotalSent');
should();

describe('getAddressTotalSent', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getAddressTotalSent = getAddressTotalSentFactory(coreAPIFixture);
      expect(getAddressTotalSent).to.be.a('function');
    });
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return a number', async () => {
    const getAddressTotalSent = getAddressTotalSentFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    let summary = await getAddressTotalSent(['XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w']);
    expect(summary).to.be.an('number');
    expect(spy.callCount).to.be.equal(1);
    summary = await getAddressTotalSent({ address: 'XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w' });
    expect(summary).to.be.an('number');
    expect(spy.callCount).to.be.equal(2);
  });

  it('Should throw if arguments are not valid', async () => {
    const getAddressTotalSent = getAddressTotalSentFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressTotalSent([])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressTotalSent({})).to.be.rejectedWith('should have required property \'address\'');
    expect(spy.callCount).to.be.equal(0);
    await expect(getAddressTotalSent({ address: 1 })).to.be.rejectedWith('address should be string');
    expect(spy.callCount).to.be.equal(0);
  });
});
