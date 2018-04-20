const spvServiceWrappedBloomFilter = async spvService =>
  async (args, callback) => {
    try {
      const filter = args[0] || args.filter;
      return callback(null, await spvService.loadBloomFilter(filter));
    } catch (error) {
      return callback({ code: 400, message: error.message });
    }
  };

module.exports = spvServiceWrappedBloomFilter;
