const { expect, should } = require('chai');
const sion = require('sinon');
const getAddressSummaryFactory = require('../../../lib/rpcServer/commands/getAddressSummary');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const spy = sion.spy(coreAPIFixture, 'getAddressSummary');
should();

describe('getAddressSummary', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getAddressSummary = getAddressSummaryFactory(coreAPIFixture);
      expect(getAddressSummary).to.be.a('function');
    });
  });

  it('Should return an object', async () => {
    const getAddressSummary = getAddressSummaryFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    const fee = await getAddressSummary('XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w');
    expect(fee).to.be.an('object');
    expect(spy.callCount).to.be.equal(1);
  });
});
