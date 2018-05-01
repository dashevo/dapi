const BloomFilter = require('bloom-filter');

const spvServiceWrappedClearBloomFilter = spvService =>
  async (args, callback) => {
    try {
      const filter = new BloomFilter(args[0] || args.filter);
      return callback(null, await spvService.clearBoomFilter(filter));
    } catch (error) {
      return callback({ code: 400, message: error.message });
    }
  };

module.exports = spvServiceWrappedClearBloomFilter;
