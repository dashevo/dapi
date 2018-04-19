const SpvService = require('../../services/spv');

const addToBloomFilter = async (args, callback) => {
  try {
    const originalFilter = args[0] || args.originalFilter;
    const element = args[1] || args.element;
    return callback(null, await SpvService.addToBloomFilter(originalFilter, element));
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = addToBloomFilter;
