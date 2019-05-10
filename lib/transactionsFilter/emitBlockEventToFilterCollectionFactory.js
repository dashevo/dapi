const { Block } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterCollection} bloomFilterCollection
 * @param {{getBlock:function(string, number): Promise<Object>}} dashCoreRpcClient
 * @return {emitBlockEventOnFilterCollection}
 */
function emitBlockEventToFilterCollectionFactory(bloomFilterCollection, dashCoreRpcClient) {
  async function emitBlockEventOnFilterCollection(blockHash) {
    const rawBlock = await dashCoreRpcClient.getBlock(blockHash, 0);

    const block = new Block(rawBlock);

    bloomFilterCollection.emit('block', block);
  }

  return emitBlockEventOnFilterCollection;
}

module.exports = emitBlockEventToFilterCollectionFactory;
