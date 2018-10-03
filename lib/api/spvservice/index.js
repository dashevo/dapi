/* eslint no-unused-vars: "warn" */
/* eslint no-new: "warn" */
const spvService = require('../../services/spv');

const loadBloomFilter = (filter) => {
  new Promise((resolve, reject) => spvService.loadBloomFilter(filter));
};

const addToBloomFilter = (filter) => { // spvService.addToBloomFilter is not a function
  new Promise((resolve, reject) => {
    spvService.addToBloomFilter(filter);
  });
};

const clearBloomFilter = (filter) => { // spvService.clearBloomFilter is not a function
  new Promise((resolve, reject) => {
    spvService.clearBloomFilter(filter);
  });
};

const getSpvData = (filter) => { // spvService.getSpvData is not a function
  new Promise((resolve, reject) => {
    spvService.getSpvData(filter);
  });
};

const findDataForBlock = (filter, blockHash) => {
  new Promise((resolve, reject) => {
    spvService.findDataForBlock(filter, blockHash);
  });
};

module.exports = {
  loadBloomFilter,
  addToBloomFilter,
  clearBloomFilter,
  getSpvData,
  findDataForBlock,
};
