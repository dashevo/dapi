const spvService = require('../../services/spv');

const loadBloomFilter = (filter) => {
  spvService.loadBloomFilter(filter);
};

module.exports = {
  loadBloomFilter,
};
