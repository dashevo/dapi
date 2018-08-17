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

const getSpvData = (filter) => {
  spvService.getSpvData(filter);
};

const findDataForBlock = (filter, blockHash) => {
  spvService.findDataForBlock(filter, blockHash);
};

module.exports = {
  loadBloomFilter,
  addToBloomFilter,
  clearBloomFilter,
  getSpvData,
  findDataForBlock,
};
