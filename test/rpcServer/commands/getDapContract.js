const chai = require('chai');
const sinon = require('sinon');
const getDapContractFactory = require('../../../lib/rpcServer/commands/getDapContract');
const dashDriveFixture = require('../../fixtures/dashDriveFixture');

const { expect } = chai;
let spy;

describe('getDapContract', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getDapContract = getDapContractFactory(dashDriveFixture);
      expect(getDapContract).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(dashDriveFixture, 'getDapContract');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return DAP contract', async () => {
    const getDapContract = getDapContractFactory(dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    let contract = await getDapContract({ dapId: '123' });
    expect(contract).to.be.an('object');
    expect(spy.callCount).to.be.equal(1);
  });

  it('Should throw an error if arguments are not valid', async () => {
    const getDapContract = getDapContractFactory(dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getDapContract({ dapId: 123 })).to.be.rejectedWith('should be string');
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