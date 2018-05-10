const BloomFilter = require('bloom-filter');

const spvServiceWrappedBloomFilter = spvService =>
  async (args) => {
    const filter = new BloomFilter(args.filter);
    return spvService.loadBloomFilter(filter);
  };

module.exports = spvServiceWrappedBloomFilter;
