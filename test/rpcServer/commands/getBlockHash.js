const chai = require('chai');
const sinon = require('sinon');
const getBlockHashFactory = require('../../../lib/rpcServer/commands/getBlockHash');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');

const { expect } = chai;
let spy;

describe('getBlockHash', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getBlockHash = getBlockHashFactory(coreAPIFixture);
      expect(getBlockHash).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'getBlockHash');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return block hash', async () => {
    const getBlockHash = getBlockHashFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    let blockHash = await getBlockHash([1]);
    expect(blockHash).to.be.a('string');
    expect(spy.callCount).to.be.equal(1);
    blockHash = await getBlockHash({ height: 100 });
    expect(blockHash).to.be.a('string');
    expect(spy.callCount).to.be.equal(2);
  });

  it('Should throw an error if arguments is not valid', async () => {
    const getBlockHash = getBlockHashFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({ height: -1 })).to.be.rejectedWith('should be >= 0');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({ height: 0.5 })).to.be.rejectedWith('should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({})).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash()).to.be.rejectedWith('should be object');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({ height: 'string' })).to.be.rejectedWith('should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash([-1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
  });
});
