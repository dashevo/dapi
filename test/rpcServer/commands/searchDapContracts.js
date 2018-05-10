const chai = require('chai');
const sinon = require('sinon');
const searchDapContractsFactory = require('../../../lib/rpcServer/commands/searchDapContracts');
const dashDriveFixture = require('../../fixtures/dashDriveFixture');

const { expect } = chai;
let spy;

describe('searchDapContracts', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getDapContract = searchDapContractsFactory(dashDriveFixture);
      expect(getDapContract).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(dashDriveFixture, 'searchDapContracts');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return an array', async () => {
    const getDapContract = searchDapContractsFactory(dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    const contractList = await getDapContract({ pattern: 'Dash' });
    expect(contractList).to.be.an('array');
    expect(spy.callCount).to.be.equal(1);
  });

  it('Should throw an error if arguments are not valid', async () => {
    const getDapContract = searchDapContractsFactory(dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract({ pattern: 123 })).to.be.rejectedWith('should be string');
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract({})).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract()).to.be.rejectedWith('should be object');
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract([123])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract([-1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
  });
});
