const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/loadBloomFilter');
const BloomFilter = require('bloom-filter');

const validator = new Validator(argsSchema);
/**
 * @param spvService
 * @return {getBlockHeaders}
 */
const loadBloomFilterFactory = (spvService) => {
  /**
   * Returns block headers
   * @typedef loadBloomFilter
   * @param args - command arguments
   * @param {string} args.offset
   * @return {Promise<Array<Object>>}
   */
  async function loadBloomFilter(args) {
    validator.validate(args);
    const filter = new BloomFilter(args.filter);
    return spvService.loadBloomFilter(filter);
  }

  return loadBloomFilter;
};

module.exports = loadBloomFilterFactory;

