const { Block, InstantLock } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @return {emitBlockEventToFilterCollection}
 */
function emitTransactionLockEventToFilterCollectionFactory(bloomFilterEmitterCollection) {
  /**
   * Emit `islock` event to bloom filter collection
   *
   * @param {Buffer} rawTransactionLock
   */
  function emitBlockEventToFilterCollection(rawTransactionLock) {
    const transactionLock = new InstantLock(rawTransactionLock);

    bloomFilterEmitterCollection.emit('txlock', transactionLock);
  }

  return emitBlockEventToFilterCollection;
}

module.exports = emitTransactionLockEventToFilterCollectionFactory;
