class SimpleCache {
  constructor() {
    this.cache = {};
  }

  set(filterHash, updateObj) {
    // Init
    this.cache[filterHash] = this.cache[filterHash] ||
          {
            transactions: [],
            merkleblocks: [],
          };

    if (updateObj.constructor.name === 'Transaction') {
      this.cache[filterHash].transactions.push(updateObj);
    } else {
      this.cache[filterHash].merkleblocks.push(updateObj);
    }
  }

  get(filterHash) {
    return this.cache[filterHash];
  }
}

module.exports = SimpleCache;
