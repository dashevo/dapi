const { MerkleBlock } = require('@dashevo/dashcore-lib');

const sinon = require('sinon');
const { expect } = require('chai');

const InstantLocksCache = require('../../../lib/transactionsFilter/InstantLocksCache');

describe('InstantLockCache', () => {
  let transactions;
  let instantLocksCache;

  beforeEach(() => {
    transactions = [
      { hash: '000000000000000000000000000000000000000000000000000000000000001b' },
      { hash: '000000000000000000000000000000000000000000000000000000000000002b' },
    ];

    instantLocksCache = new InstantLocksCache();
  });

  describe('#addTransactionHashToInstantLockWaitingList', () => {
    it('should add transaction', () => {
      const [firstTx] = transactions;

      instantLocksCache.addTransactionHashToInstantLockWaitingList(firstTx);

      expect(instantLocksCache.transactionHashes).to.deep.equal([
        {
          transactionHash: firstTx.hash,
          blocksSpentInCache: 0,
        },
      ]);
    });
  });

  describe('#isInCache', () => {
    it('should return true if the transaction in the cache', () => {
      const [firstTx] = transactions;

      instantLocksCache.addTransactionHashToInstantLockWaitingList(firstTx);

      expect(instantLocksCache.isInCache(firstTx.hash)).to.be.true();
    });

    it('should return false if transaction is not in cache', () => {
      const [firstTx, secondTx] = transactions;

      instantLocksCache.addTransactionHashToInstantLockWaitingList(firstTx);

      expect(instantLocksCache.isInCache(secondTx.hash)).to.be.false();
    });
  });

  describe('#incrementBlockSpentInCacheForEveryTransaction', () => {
    it('should increment blocks count on every transaction in the cache', () => {
      const [firstTx, secondTx] = transactions;

      instantLocksCache.addTransactionHashToInstantLockWaitingList(firstTx);

      expect(instantLocksCache.transactionHashes).to.deep.equal([
        {
          transactionHash: firstTx.hash,
          blocksSpentInCache: 0
        },
      ]);

      instantLocksCache.incrementBlockSpentInCacheForEveryTransaction();
      instantLocksCache.addTransactionHashToInstantLockWaitingList(secondTx);
      instantLocksCache.incrementBlockSpentInCacheForEveryTransaction();

      expect(instantLocksCache.transactionHashes).to.deep.equal([
        {
          transactionHash: firstTx.hash,
          blocksSpentInCache: 2
        },
        {
          transactionHash: secondTx.hash,
          blocksSpentInCache: 1
        }
      ]);
    });
  });

  describe('#removeTransactionHashFromWaitingList', () => {
    it('should remove transaction from a waiting list', () => {
      const [firstTx, secondTx] = transactions;

      instantLocksCache.addTransactionHashToInstantLockWaitingList(firstTx);
      instantLocksCache.addTransactionHashToInstantLockWaitingList(secondTx);

      expect(instantLocksCache.transactionHashes).to.be.deep.equal([
        {
          transactionHash: firstTx.hash,
          blocksSpentInCache: 0,
        },
        {
          transactionHash: secondTx.hash,
          blocksSpentInCache: 0,
        },
      ]);

      instantLocksCache.removeTransactionHashFromWaitingList(firstTx.hash);

      expect(instantLocksCache.transactionHashes).to.be.deep.equal([
        {
          transactionHash: secondTx.hash,
          blocksSpentInCache: 0,
        },
      ]);
    });
  });
});
