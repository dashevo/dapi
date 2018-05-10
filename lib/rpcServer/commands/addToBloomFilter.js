const BloomFilter = require('bloom-filter');

const spvServiceWrappedAddToBloomFilter = spvService =>
  async (args) => {
    const originalFilter = new BloomFilter(args.originalFilter);
    const { element } = args;
    return spvService.addToBloomFilter(originalFilter, element);
  };

module.exports = spvServiceWrappedAddToBloomFilter;
