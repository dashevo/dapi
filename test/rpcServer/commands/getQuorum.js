const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getQuorumFactory = require('../../../lib/rpcServer/commands/getQuorum');
const coreApiFixture = require('../../fixtures/coreAPIFixture');

chai.use(chaiAsPromised);
const { expect } = chai;
let spy;

describe('fetchDapContract', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getDapContract = getQuorumFactory(coreApiFixture);
      expect(getDapContract).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreApiFixture, 'getQuorum');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return assigned quorum with proofs', async () => {
    const getQuorumContract = getQuorumFactory(coreApiFixture);
    expect(spy.callCount).to.be.equal(0);
    const randomId = 'c4ba45dcdfe2461e17a54d43ce12751c16cefd61';
    const contract = await getQuorumContract({ regTxId: randomId });
    expect(contract).to.be.an('object');
    expect(spy.callCount).to.be.equal(1);


    const quorum = contract.quorum[0];

    expect(quorum.isValid).to.be.equal(true);
    expect(quorum.keyIDOperator).to.be.equal('43ce12751c4ba45dcdfe2c16cefd61461e17a54d');
    expect(quorum.keyIDVoting).to.be.equal('43ce12751c4ba45dcdfe2c16cefd61461e17a54d');
    expect(quorum.proRegTxHash).to.be.equal('f7737beb39779971e9bc59632243e13fc5fc9ada93b69bf48c2d4c463296cd5a');
    expect(quorum.service).to.be.equal('207.154.244.13:19999');
  });

  it('Should throw an error if arguments are not valid', async () => {
    const regTxId = 'c4ba45dcdfe2461e17a54d43ce12751c16cefd61';
    const getDapContract = await getQuorumFactory(coreApiFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract({ regTxId: 0 })).to.be.rejectedWith('should be string');
    expect(spy.callCount).to.be.equal(0);
  });
});
