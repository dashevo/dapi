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

  it('Should return an object', async () => {
    const getAddressTotalReceived = getAddressTotalReceivedFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    const fee = await getAddressTotalReceived('XsLdVrfJpzt6Fc8RSUFkqYqtxkLjEv484w');
    expect(fee).to.be.an('number');
    expect(spy.callCount).to.be.equal(1);
  });
});
