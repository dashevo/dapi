const { Block } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @return {emitBlockEventOnFilterCollection}
 */
function emitBlockEventToFilterCollectionFactory(bloomFilterEmitterCollection) {
  function emitBlockEventOnFilterCollection(rawBlock) {
    const block = new Block(rawBlock);

    bloomFilterEmitterCollection.emit('block', block);
  }

  return emitBlockEventOnFilterCollection;
}

module.exports = emitBlockEventToFilterCollectionFactory;
