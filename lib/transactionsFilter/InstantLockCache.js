const BLOCKS_TO_STAY_IN_CACHE = 10;

class InstantLockCache {
  constructor() {
    this.transactionHashes = [];
    this.transactionHashesMap = {};
  }

  isInCache(transactionHash) {
    return this.transactionHashes
      .filter(({ transactionHash: cachedTransactionHash }) => cachedTransactionHash === transactionHash)
      .length > 0;
  }

  addTransactionHashToInstantLockWaitingList(transaction) {
    if (this.isInCache(transaction.hash)) {
      return;
    }

    this.transactionHashes.push({
      transactionHash: transaction.hash,
      blocksSpentInCache: 0,
    });
  }

  incrementBlockSpentInCacheForEveryTransaction() {
    this.transactionHashes.forEach((txHash) => {
      txHash.blocksSpentInCache += 1;

      if (txHash.blocksSpentInCache > BLOCKS_TO_STAY_IN_CACHE) {
        this.removeTransactionHashFromWaitingList(txHash.transactionHash);
      }
    })
  }

  removeTransactionHashFromWaitingList(transactionHash) {
    const transactionHashIndex = this.transactionHashes.findIndex((txHash) => {
      return txHash.transactionHash === transactionHash;
    });

    if (transactionHashIndex >= 0) {
      this.transactionHashes.splice(transactionHashIndex, 1);
    }
  }
}

module.exports = InstantLockCache;
