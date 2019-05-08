const { Block } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterCollection} bloomFilterCollection
 * @param {function(string, number): Promise<Object>} getBlock
 * @return {emitBlockEventOnFilterCollection}
 */
function emitBlockEventToFilterCollectionFactory(bloomFilterCollection, getBlock) {
  async function emitBlockEventOnFilterCollection(blockHash) {
    const rawBlock = await getBlock(blockHash, 0);

    const block = new Block(rawBlock);

    bloomFilterCollection.emit('block', block);
  }

  return emitBlockEventOnFilterCollection;
}

module.exports = emitBlockEventToFilterCollectionFactory;
