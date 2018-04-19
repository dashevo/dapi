const SpvService = require('../../services/spv');

const clearBloomFilter = async (args, callback) => {
  try {
    const filter = args[0] || args.filter;
    return callback(null, await SpvService.clearBoomFilter(filter));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = clearBloomFilter;
