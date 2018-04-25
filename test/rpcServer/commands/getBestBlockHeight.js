const { expect } = require('chai');
const sinon = require('sinon');
const getBestBlockHeightFactory = require('../../../lib/rpcServer/commands/getBestBlockHeight.js');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

let spy;

describe('getBestBlockHeight', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getBestBlockHeight = getBestBlockHeightFactory(coreAPIFixture);
      expect(getBestBlockHeight).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'getBestBlockHeight');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return a number', async () => {
    const getBestBlockHeight = getBestBlockHeightFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    const bestBlockHeight = await getBestBlockHeight();
    expect(bestBlockHeight).to.be.an('number');
    expect(spy.callCount).to.be.equal(1);
  });
});
