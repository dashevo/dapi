const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getBestBlockHashFactory = require('../../../../lib/rpcServer/commands/getBestBlockHash.js');
const coreAPIFixture = require('../../../mocks/coreAPIFixture');
const RPCError = require('../../../../lib/rpcServer/RPCError');

chai.use(chaiAsPromised);
const { expect } = chai;
let spy;

describe('getBestBlockHash', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getBestBlockHash = getBestBlockHashFactory(coreAPIFixture);
      expect(getBestBlockHash).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'getBestBlockHash');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return a number', async () => {
    const getBestBlockHash = getBestBlockHashFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    const bestBlockHash = await getBestBlockHash();
    expect(bestBlockHash).to.be.an('string');
    expect(spy.callCount).to.be.equal(1);
  });

  it('should throw RPCError with code -32603', async function it() {
    const message = 'Some error';
    const e = new Error(message);

    coreAPIFixture.getBestBlockHash = this.sinon.stub().throws(e);
    const getBestBlockHash = getBestBlockHashFactory(coreAPIFixture);

    try {
      await getBestBlockHash();

      expect.fail('should throw RPCError');
    } catch (e) {
      expect(e).to.be.an.instanceOf(RPCError);
      expect(e.code).to.equal(-32603);
      expect(e.message).to.equal(message);
    }
  });

  it('should throw RPCError with code -32602', async function it() {
    const message = 'Some error';
    const e = new Error(message);
    e.statusCode = 400;

    coreAPIFixture.getBestBlockHash = this.sinon.stub().throws(e);
    const getBestBlockHash = getBestBlockHashFactory(coreAPIFixture);

    try {
      await getBestBlockHash();

      expect.fail('should throw RPCError');
    } catch (e) {
      expect(e).to.be.an.instanceOf(RPCError);
      expect(e.code).to.equal(-32602);
      expect(e.message).to.equal(message);
    }
  });
});
