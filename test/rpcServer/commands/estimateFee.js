const { expect, should } = require('chai');
const sion = require('sinon');
const estimateFeeFactory = require('../../../lib/rpcServer/commands/estimateFee');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const spy = sion.spy(coreAPIFixture, 'estimateFee');
should();

describe('estimateFee', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const estimateFee = estimateFeeFactory(coreAPIFixture);
      expect(estimateFee).to.be.a('function');
    });
  });

  it('Should return a number', async () => {
    const estimateFee = estimateFeeFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    const fee = await estimateFee(1);
    expect(fee).to.be.a('number');
    expect(spy.callCount).to.be.equal(1);
  });
});
