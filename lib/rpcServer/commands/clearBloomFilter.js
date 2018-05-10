const BloomFilter = require('bloom-filter');

const spvServiceWrappedClearBloomFilter = spvService =>
  async (args) => {
    const filter = new BloomFilter(args.filter);
    return spvService.clearBoomFilter(filter);
  };

module.exports = spvServiceWrappedClearBloomFilter;
