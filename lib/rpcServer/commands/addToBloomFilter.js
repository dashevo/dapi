const spvServiceWrappedAddToBloomFilter = async spvService =>
  async (args, callback) => {
    try {
      const originalFilter = args[0] || args.originalFilter;
      const element = args[1] || args.element;
      return callback(null, await spvService.addToBloomFilter(originalFilter, element));
    } catch (error) {
      return callback({ code: 400, message: error.message });
    }
  };

module.exports = spvServiceWrappedAddToBloomFilter;
