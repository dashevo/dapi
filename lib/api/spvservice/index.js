const { spvService } = require('../../services/corep2p');

const loadBloomFilter = (filter) => {
  spvService.loadBloomFilter(filter);
};

const addToBloomFilter = (filter) => {
  spvService.addToBloomFilter(filter);
};

const clearBloomFilter = (filter) => {
  spvService.clearBloomFilter(filter);
};

const getSpvData = (filter) => {
  spvService.getSpvData(filter);
};

module.exports = {
  loadBloomFilter,
  addToBloomFilter,
  clearBloomFilter,
  getSpvData,
};
