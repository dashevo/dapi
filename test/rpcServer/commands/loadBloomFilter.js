const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const loadBloomFilterFactory = require('../../../lib/rpcServer/commands/loadBloomFilter');
const userIndex = require('../../fixtures/userIndexFixture');
const BloomFilter = require('bloom-filter');

chai.use(chaiAsPromised);
const { expect } = chai;

describe('loodBloomfilter', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const loadBloomfilter = loadBloomFilterFactory(userIndex);
      expect(loadBloomfilter).to.be.a('function');
    });
  });

  it('load a bloomfilter', async () => {
    const loadBloomFilter = loadBloomFilterFactory(userIndex);
    // expect(spy.callCount).to.be.equal(0);
    const users = await loadBloomFilter({ filter: BloomFilter.create(10, 0.01) });
    const x = 5;
  });
});
