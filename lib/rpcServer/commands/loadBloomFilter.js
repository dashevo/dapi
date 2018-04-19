const SpvService = require('../../services/spv');

const loadBloomFilter = async (args, callback) => {
  try {
    const filter = args[0] || args.filter;
    return callback(null, await SpvService.loadBloomFilter(filter));
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = loadBloomFilter;
