const { Block } = require('@dashevo/dashcore-lib');

function emitBlockEventToFilterCollectionFactory(bloomFilterCollection, getBlock) {
  async function emitBlockEventOnFilterCollection(blockHash) {
    const rawBlock = await getBlock(blockHash);

    const block = new Block(rawBlock);

    bloomFilterCollection.emit('block', block);
  }

  return emitBlockEventOnFilterCollection;
}

module.exports = emitBlockEventToFilterCollectionFactory;
