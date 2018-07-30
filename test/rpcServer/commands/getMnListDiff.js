const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');
const getMnListDiffFactory = require('../../../lib/rpcServer/commands/getMnListDiff');

chai.use(chaiAsPromised);
const { expect } = chai;

const coreAPI = require('../../../lib/app');

describe('getMnListDiff', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getBalance = getMnListDiffFactory(coreAPI);
      expect(getBalance).to.be.a('function');
    });

    it('Should return a number', async () => {
      const diff = getMnListDiffFactory(coreAPI);
    });
  });
});
