const BloomFilter = require('bloom-filter');

const spvServiceWrappedSpvData = spvService =>
  async (args) => {
    const filter = new BloomFilter(args.filter);
    return spvService.getData(filter);
  };

module.exports = spvServiceWrappedSpvData;
