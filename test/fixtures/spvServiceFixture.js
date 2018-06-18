module.exports = {
  async loadBloomFilter(filter) { return new Promise((resolve, reject) => { resolve(true); }); },
  async addToBloomFilter(filter) { return new Promise((resolve, reject) => { resolve(true); }); },
  async clearBloomFilter(filter) { return new Promise((resolve, reject) => { resolve(true); }); },
  async getSpvData(filter) { return { transactions: [], merkleblocks: [] }; },
};
