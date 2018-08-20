const spvService = require('../../services/spv');

const loadBloomFilter = (filter) => {
    new Promise((resolve, reject) => {//spvService.loadBloomFilter is not a function
        return spvService.loadBloomFilter(filter);
    })
};

const addToBloomFilter = (filter) => {//spvService.addToBloomFilter is not a function
    new Promise((resolve, reject) => {
        spvService.addToBloomFilter(filter);
    })
};

const clearBloomFilter = (filter) => {//spvService.clearBloomFilter is not a function
    new Promise((resolve, reject) => {
        spvService.clearBloomFilter(filter);
    })
};

const getSpvData = (filter) => {//spvService.getSpvData is not a function
    new Promise((resolve, reject) => {
        spvService.getSpvData(filter);
    })
};

module.exports = {
    loadBloomFilter,
    addToBloomFilter,
    clearBloomFilter,
    getSpvData,
};
