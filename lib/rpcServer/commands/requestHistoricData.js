const BloomFilter = require('bloom-filter');

const spvServiceWrappedAddToBloomFilter = spvService =>
  async (args) => {
    const filter = new BloomFilter(args.filter);
    return spvService.requestHistoricData(filter);
  };

module.exports = spvServiceWrappedAddToBloomFilter;
