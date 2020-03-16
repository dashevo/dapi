const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getMNListDiffFactory = require('../../../../lib/rpcServer/commands/getMnListDiff');
const coreAPIFixture = require('../../../mocks/coreAPIFixture');
const RPCError = require('../../../../lib/rpcServer/RPCError');

chai.use(chaiAsPromised);
const { expect } = chai;
let spy;
let baseBlockHash;
let blockHash;

describe('getMNListDiff', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getMNListDiff = getMNListDiffFactory(coreAPIFixture);
      expect(getMNListDiff).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'getMnListDiff');
  });

  beforeEach(() => {
    spy.resetHistory();


    baseBlockHash = '0000000000000000000000000000000000000000000000000000000000000000';
    blockHash = '0000000000000000000000000000000000000000000000000000000000000000';
  });

  after(() => {
    spy.restore();
  });

  it('Should return a masternode list difference list object', async () => {
    const getMNListDiff = getMNListDiffFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);

    const mnDiffList = await getMNListDiff({ baseBlockHash, blockHash });
    expect(mnDiffList).to.be.an('object');
    expect(mnDiffList.baseBlockHash.length).to.equal(64);
    expect(mnDiffList.blockHash.length).to.equal(64);
    expect(mnDiffList.merkleRootMNList.length).to.equal(64);
    expect(mnDiffList.deletedMNs).to.be.an('Array');
    expect(mnDiffList.mnList).to.be.an('Array');

    expect(spy.callCount).to.be.equal(1);
  });

  it('should throw RPCError with code -32603', async function it() {
    const message = 'Some error';
    const e = new Error(message);

    coreAPIFixture.getMnListDiff = this.sinon.stub().throws(e);
    const getMNListDiff = getMNListDiffFactory(coreAPIFixture);

    try {
      await getMNListDiff({ baseBlockHash, blockHash });

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

    coreAPIFixture.getMnListDiff = this.sinon.stub().throws(e);
    const getMNListDiff = getMNListDiffFactory(coreAPIFixture);

    try {
      await getMNListDiff({ baseBlockHash, blockHash });

      expect.fail('should throw RPCError');
    } catch (e) {
      expect(e).to.be.an.instanceOf(RPCError);
      expect(e.code).to.equal(-32602);
      expect(e.message).to.equal(message);
    }
  });
});
