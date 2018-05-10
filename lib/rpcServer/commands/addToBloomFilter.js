const BloomFilter = require('bloom-filter');

const spvServiceWrappedAddToBloomFilter = spvService =>
  async (args) => {
    const originalFilter = new BloomFilter(args[0] || args.originalFilter);
    const element = args[1] || args.element;
    return spvService.addToBloomFilter(originalFilter, element);
  };

module.exports = spvServiceWrappedAddToBloomFilter;
