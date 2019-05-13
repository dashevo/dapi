const { Block } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterCollection} bloomFilterCollection
 * @return {emitBlockEventOnFilterCollection}
 */
function emitBlockEventToFilterCollectionFactory(bloomFilterCollection) {
  async function emitBlockEventOnFilterCollection(rawBlock) {
    const block = new Block(rawBlock);

    bloomFilterCollection.emit('block', block);
  }

  return emitBlockEventOnFilterCollection;
}

module.exports = emitBlockEventToFilterCollectionFactory;
