const chai = require('chai');
const index = require('../../../lib/api/spvservice/index');

const { expect } = chai;

describe('spvservice/index', () => {
  describe('#factory', () => {
    it('should be loadBloomFilter function', () => {
      const res = index.loadBloomFilter;
      expect(res).to.be.a('function');
    });
    it('should be addToBloomFilter function', () => {
      const res = index.addToBloomFilter;
      expect(res).to.be.a('function');
    });

    it('should be clearBloomFilter function', () => {
      const res = index.clearBloomFilter;
      expect(res).to.be.a('function');
    });

    it('should be getSpvData function', () => {
      const res = index.getSpvData;
      expect(res).to.be.a('function');
    });

    it('should be undefined with invalid loadBloomFilter function', () => {
      const res = index.loadBloomFilter('filter');
      expect(res).to.be.a('undefined');
    });
    it('should be undefined with invalid loadBloomFilter function', () => {
      const res = index.addToBloomFilter('filter');
      expect(res).to.be.a('undefined');
    });

    it('should be undefined with invalid  clearBloomFilter function', () => {
      const res = index.clearBloomFilter('filter');
      expect(res).to.be.a('undefined');
    });
    it('should be undefined with invalid getSpvData', () => {
      const res = index.getSpvData('filter');
      expect(res).to.be.a('undefined');
    });
  });
});
