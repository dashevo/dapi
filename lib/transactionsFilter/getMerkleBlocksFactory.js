const { MerkleBlock } = require('@dashevo/dashcore-lib');

/**
 * @param {CoreRpcClient} coreAPI
 * @return {function(string, string, number): MerkleBlock[]}
 */
function getMerkleBlocksFactory(coreAPI) {
  /**
   * @param {string} bloomFilter
   * @param {string} fromBlockHash
   * @param {number} [count]
   * @return {Promise<MerkleBlock[]>}
   */
  async function getMerkleBlocks(bloomFilter, fromBlockHash, count) {
    const merkleBlocks = await coreAPI.getMerkleBlocks(bloomFilter, fromBlockHash, count);
    return merkleBlocks.map(serializedMerkleBlock => new MerkleBlock(Buffer.from(serializedMerkleBlock, 'hex')));
  }

  return getMerkleBlocks;
}

module.exports = getMerkleBlocksFactory;
