const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/clearBloomFilter');
const BloomFilter = require('bloom-filter');

const validator = new Validator(argsSchema);
/**
 * @param spvService
 * @return {getBlockHeaders}
 */
const clearBloomFilterFactory = (spvService) => {
  /**
   * Returns block headers
   * @typedef clearBloomFilter
   * @param args - command arguments
   * @param {string} args.offset
   * @return {Promise<Array<Object>>}
   */
  async function clearBloomFilter(args) {
    validator.validate(args);
    const filter = new BloomFilter(args.filter);
    return spvService.clearBloomFilter(filter);
  }

  return clearBloomFilter;
};

module.exports = clearBloomFilterFactory;
