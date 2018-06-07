const BloomFilter = require('bloom-filter');

const spvServiceWrappedBloomFilter = spvService =>
  async (args) => {
    const filter = new BloomFilter(args.filter);
    return spvService.loadBloomFilter(filter);
  };

module.exports = spvServiceWrappedBloomFilter;

// const validator = new Validator(argsSchema);
// /**
//  * @param coreAPI
//  * @return {getBlockHeaders}
//  */
// const getBlockHeadersFactory = (coreAPI) => {
//   /**
//    * Returns block headers
//    * @typedef getBlockHeaders
//    * @param args - command arguments
//    * @param {string} args.offset
//    * @param {string} args.limit - number of block headers to return
//    * @return {Promise<Array<Object>>}
//    */
//   async function getBlockHeaders(args) {
//     validator.validate(args);
//     const { offset, limit } = args;
//     return coreAPI.getBlockHeaders(offset, limit);
//   }

//   return getBlockHeaders;
// };

// module.exports = getBlockHeadersFactory;
