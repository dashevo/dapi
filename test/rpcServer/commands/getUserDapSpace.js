const chai = require('chai');
const sinon = require('sinon');
const getUserDapSpaceFactory = require('../../../lib/rpcServer/commands/getUserDapSpace');
const dashDriveFixture = require('../../fixtures/dashDriveFixture');

const { expect } = chai;
let spy;

describe('getUserDapSpace', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getUserDapSpace = getUserDapSpaceFactory(dashDriveFixture);
      expect(getUserDapSpace).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(dashDriveFixture, 'getDapSpace');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return blockchain user', async () => {
    const getUserDapSpace = getUserDapSpaceFactory(dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    let user = await getUserDapSpace({ username: 'alice', dapId: '123' });
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(1);
    user = await getUserDapSpace({ userId: 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa', dapId: '123' });
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(2);
    user = await getUserDapSpace(['123', 'alice']);
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(3);
    user = await getUserDapSpace(['123', 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa']);
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(4);
  });

  it('Should throw an error if arguments is not valid', async () => {
    const getUserDapSpace = getUserDapSpaceFactory(dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace({ username: 123 })).to.be.rejectedWith('should be string');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace({ userId: 123 })).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace({})).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace({ dapId: '123' })).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace({ dapId: 123, username: 'alice' })).to.be.rejectedWith('should be string');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace()).to.be.rejectedWith('should be object');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace([123, 'alice'])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace(['123', 123])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    // todo
    // await expect(getUserDapSpace({ username: 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa' })).to.be.rejectedWith('should be integer');
    // expect(spy.callCount).to.be.equal(0);
    // todo
    // await expect(getUserDapSpace({ userId: 'alice' })).to.be.rejectedWith('should be integer');
    // expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapSpace([-1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
  });
});
