class SimpleCache {
  constructor() {
    this.cache = {};
  }

  set(bloomfilter, updateObj) {
    // Init
    this.cache[bloomfilter] = this.cache[bloomfilter] ||
          {
            transactions: [],
            merkleblocks: [],
          };

    if (updateObj.constructor.name === 'Transaction') {
      this.cache[bloomfilter].transactions.push(updateObj);
    } else {
      this.cache[bloomfilter].merkleblocks.push(updateObj);
    }
  }

  get(bloomfilter) {
    return this.cache[bloomfilter];
  }
}

module.exports = SimpleCache;
