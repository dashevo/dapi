const { InstantLock } = require('@dashevo/dashcore-lib');

/**
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @return {testBlockEventToFilterCollection}
 */
function emitInstantLockToFilterCollectionFactory(bloomFilterEmitterCollection) {
  /**
   * Emit `islock` event to bloom filter collection
   *
   * @param {Buffer} rawTransactionLock
   */
  function testBlockEventToFilterCollection(rawTransactionLock) {
    const transactionLock = new InstantLock(rawTransactionLock);

    bloomFilterEmitterCollection.emit('instantLock', transactionLock);
  }

  return testBlockEventToFilterCollection;
}

module.exports = emitInstantLockToFilterCollectionFactory;
