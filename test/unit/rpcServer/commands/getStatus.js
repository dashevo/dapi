const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getStatusFactory = require('../../../../lib/rpcServer/commands/getStatus.js');
const coreAPIFixture = require('../../../mocks/coreAPIFixture');

chai.use(chaiAsPromised);
const { expect } = chai;
let spy;

describe('getStatus', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getStatus = getStatusFactory(coreAPIFixture);
      expect(getStatus).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'getStatus');
  });

  beforeEach(() => {
    spy.resetHistory();
  });

  after(() => {
    spy.restore();
  });

  it('Should return a status object', async () => {
    const getStatus = getStatusFactory(coreAPIFixture);
    expect(spy.callCount).to.be.equal(0);
    const status = await getStatus();
    expect(status).to.be.an('object');
    expect(status.protocol_version).to.be.an('number');
    expect(status.blocks).to.be.an('number');
    expect(spy.callCount).to.be.equal(1);
  });
});
