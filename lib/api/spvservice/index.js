const spvService = require('../../services/spv');

const loadBloomFilter = (filter) => {
  spvService.loadBloomFilter(filter);
};

const addToBloomFilter = (filter) => {
  spvService.addToBloomFilter(filter);
};

const clearBloomFilter = (filter) => {
  spvService.clearBloomFilter(filter);
};

module.exports = {
  loadBloomFilter,
  addToBloomFilter,
  clearBloomFilter,
};
