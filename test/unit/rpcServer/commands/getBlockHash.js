const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getBlockHashFactory = require('../../../../lib/rpcServer/commands/getBlockHash');
const coreAPIFixture = require('../../../mocks/coreAPIFixture');
const RPCError = require('../../../../lib/rpcServer/RPCError');

chai.use(chaiAsPromised);
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
    const blockHash = await getBlockHash({ height: 100 });
    expect(blockHash).to.be.a('string');
    expect(spy.callCount).to.be.equal(1);
  });

  it('Should throw an error if arguments are not valid', async () => {
    const getBlockHash = getBlockHashFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({ height: -1 })).to.be.rejectedWith('params.height should be >= 0');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({ height: 0.5 })).to.be.rejectedWith('params.height should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({})).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash()).to.be.rejectedWith('params should be object');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash({ height: 'string' })).to.be.rejectedWith('params.height should be integer');
    expect(spy.callCount).to.be.equal(0);
    await expect(getBlockHash([-1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
  });

  it('should throw RPCError with code -32603', async function it() {
    const message = 'Some error';
    const e = new Error(message);

    coreAPIFixture.getBlockHash = this.sinon.stub().throws(e);
    const getBlockHash = getBlockHashFactory(coreAPIFixture);

    try {
      await getBlockHash({ height: 100 });

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

    coreAPIFixture.getBlockHash = this.sinon.stub().throws(e);
    const getBlockHash = getBlockHashFactory(coreAPIFixture);

    try {
      await getBlockHash({ height: 100 });

      expect.fail('should throw RPCError');
    } catch (e) {
      expect(e).to.be.an.instanceOf(RPCError);
      expect(e.code).to.equal(-32602);
      expect(e.message).to.equal(message);
    }
  });
});
