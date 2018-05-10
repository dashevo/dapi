const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getUserDapContextFactory = require('../../../lib/rpcServer/commands/getUserDapContext');
const dashDriveFixture = require('../../fixtures/dashDriveFixture');
const userIndexFixture = require('../../fixtures/userIndexFixture');

chai.use(chaiAsPromised);
const { expect } = chai;
let spy;

describe('getUserDapContext', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getUserDapContext = getUserDapContextFactory(dashDriveFixture, userIndexFixture);
      expect(getUserDapContext).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(dashDriveFixture, 'getDapContext');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return blockchain user', async () => {
    const getUserDapContext = getUserDapContextFactory(dashDriveFixture, userIndexFixture);
    expect(spy.callCount).to.be.equal(0);
    let user = await getUserDapContext({ username: 'alice', dapId: '123' });
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(1);
    user = await getUserDapContext({
      userId: 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa',
      dapId: '123',
    });
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(2);
    user = await getUserDapContext(['123', 'alice']);
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(3);
    user = await getUserDapContext(['123', 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa']);
    expect(user).to.be.an('object');
    expect(spy.callCount).to.be.equal(4);
  });

  it('Should throw an error if arguments are not valid', async () => {
    const getUserDapContext = getUserDapContextFactory(dashDriveFixture, userIndexFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext({ username: 123 })).to.be.rejectedWith('should be string');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext({ userId: 123 })).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext({})).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext({ dapId: '123' })).to.be.rejectedWith('should have required property');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext({ dapId: 123, username: 'alice' })).to.be.rejectedWith('should be string');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext()).to.be.rejectedWith('should be object');
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext([123, 'alice'])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext(['123', 123])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    // todo
    // await expect(getUserDapContext({
    // username: 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa'
    // })).to.be.rejectedWith('should be integer');
    // expect(spy.callCount).to.be.equal(0);
    // todo
    // await expect(getUserDapContext({ userId: 'alice' })).to.be.rejectedWith('should be integer');
    // expect(spy.callCount).to.be.equal(0);
    await expect(getUserDapContext([-1])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
  });
});
