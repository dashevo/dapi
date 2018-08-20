const chai = require('chai');
const Net = require('../../../lib/services/net/net');

const { expect } = chai;

describe('services/net/net', () => {
  describe('#factory', () => {
    it('should create Net instanse', () => {
      const res = new Net();
      expect(res).to.be.instanceof(Net);
    });
  });
  // TODO add more tests
});
