const { EventEmitter } = require('events');

/**
 * @template T
 */
class BloomFilterEmitter extends EventEmitter {
  /**
   * @param {Filter} bloomFilter
   * @param {function(Filter, T): boolean} testFunction
   */
  constructor(bloomFilter, testFunction) {
    super();

    this.bloomFilter = bloomFilter;
    this.testFunction = testFunction;
  }

  /**
   * Test data against bloom filter
   *
   * @param {T} data
   * @return {boolean}
   */
  test(data) {
    const result = this.testFunction(this.bloomFilter, data);

    if (result) {
      this.emit('match', data);
    }

    return result;
  }
}

module.exports = BloomFilterEmitter;
