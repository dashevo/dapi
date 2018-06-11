const BloomFilter = require('bloom-filter');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/addToBloomFilter');

const validator = new Validator(argsSchema);
/**
 * @param spvService
 * @return {getBlockHeaders}
 */
const addToBloomFilterFactory = (spvService) => {
  /**
   * Returns block headers
   * @typedef addToBloomFilterFactory
   * @param args - command arguments
   * @param {string} args.offset
   * @return {Promise<object>}
   */
  async function addToBloomFilter(args) {
    validator.validate(args);
    const originalFilter = new BloomFilter(args.originalFilter);
    const { element } = args;
    return spvService.addToBloomFilter(originalFilter, element);
  }

  return addToBloomFilter;
};

module.exports = addToBloomFilterFactory;
