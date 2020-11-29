const { MerkleBlock } = require('@dashevo/dashcore-lib');

const sinon = require('sinon');
const { expect } = require('chai');

const InstantLockCache = require('../../../lib/transactionsFilter/InstantLockCache');

describe('InstantLockCache', () => {
  let transactions;
  let blocks;
  let merkleBlocks;
  let instantLocksCache;

  beforeEach(() => {
    expect.fail("Not implemented");

    transactions = [
      { hash: '000000000000000000000000000000000000000000000000000000000000001b' },
      { hash: '000000000000000000000000000000000000000000000000000000000000002b' },
      { hash: '000000000000000000000000000000000000000000000000000000000000003b' },
      { hash: '000000000000000000000000000000000000000000000000000000000000004b' },
      { hash: '000000000000000000000000000000000000000000000000000000000000005b' },
      { hash: '000000000000000000000000000000000000000000000000000000000000006b' },
    ];

    blocks = [
      {
        hash: '000000000000000000000000000000000000000000000000000000000000001b',
        transactions: [transactions[0], transactions[1]],
        header: {
          hash: '000000000000000000000000000000000000000000000000000000000000001b',
        },
      },
      {
        hash: '000000000000000000000000000000000000000000000000000000000000002b',
        transactions: [transactions[2], transactions[3]],
        header: {
          hash: '000000000000000000000000000000000000000000000000000000000000002b',
        },
      },
      {
        hash: '000000000000000000000000000000000000000000000000000000000000003b',
        transactions: [transactions[4], transactions[5]],
        header: {
          hash: '000000000000000000000000000000000000000000000000000000000000003b',
        },
      },

      {
        hash: '000000000000000000000000000000000000000000000000000000000000004b',
        transactions: [transactions[0], transactions[1]],
        header: {
          hash: '000000000000000000000000000000000000000000000000000000000000004b',
        },
      },
    ];

    merkleBlocks = blocks.map(block => ({ header: { hash: block.hash } }));

    sinon.stub(MerkleBlock, 'build');

    blocks.forEach((block, index) => {
      MerkleBlock.build
        .withArgs(block.header, sinon.match.any, sinon.match.any)
        .returns(merkleBlocks[index]);
    });

    instantLocksCache = new InstantLockCache();
  });

  afterEach(() => {
    MerkleBlock.build.restore();
  });

  describe('#addTransactionHashToInstantLockWaitingList', () => {
    expect.fail();
    it('should add transaction', () => {
      const [firstTx] = transactions;

      instantLocksCache.addTransaction(firstTx);

      expect(instantLocksCache.transactions).to.deep.equal([
        {
          transaction: firstTx,
          isRetrieved: false,
        },
      ]);
    });
  });

  describe('#isInCache', () => {
    expect.fail();
    it('should add a block if it has matched transactions', () => {
      const [block] = blocks;

      instantLocksCache.addTransaction(transactions[0]);
      instantLocksCache.addTransaction(transactions[1]);

      instantLocksCache.addBlock(block);

      expect(instantLocksCache.blocks).to.deep.equal(
        [block],
      );
    });

    it('should remove data if cache size is reached', () => {
      instantLocksCache.cacheSize = 2;

      instantLocksCache.addTransaction(transactions[0]);
      instantLocksCache.addTransaction(transactions[1]);
      instantLocksCache.addTransaction(transactions[2]);
      instantLocksCache.addTransaction(transactions[3]);
      instantLocksCache.addTransaction(transactions[4]);
      instantLocksCache.addTransaction(transactions[5]);

      instantLocksCache.addBlock(blocks[0]);
      instantLocksCache.addBlock(blocks[1]);
      instantLocksCache.addBlock(blocks[2]);

      expect(instantLocksCache.transactions).to.deep.equal([
        { transaction: transactions[2], isRetrieved: false },
        { transaction: transactions[3], isRetrieved: false },
        { transaction: transactions[4], isRetrieved: false },
        { transaction: transactions[5], isRetrieved: false },
      ]);

      expect(instantLocksCache.merkleBlocks).to.deep.equal([
        { merkleBlock: merkleBlocks[1], isRetrieved: false },
        { merkleBlock: merkleBlocks[2], isRetrieved: false },
      ]);

      expect(instantLocksCache.blocks).to.deep.equal(
        [blocks[1], blocks[2]],
      );
    });
  });

  describe('#incrementBlockSpentInCacheForEveryTransaction', () => {
    expect.fail();
    it('should return block count', () => {
      instantLocksCache.addTransaction(transactions[0]);
      instantLocksCache.addTransaction(transactions[1]);
      instantLocksCache.addTransaction(transactions[2]);
      instantLocksCache.addTransaction(transactions[3]);

      instantLocksCache.addBlock(blocks[0]);
      instantLocksCache.addBlock(blocks[1]);

      expect(instantLocksCache.getBlockCount()).to.equal(2);
    });
  });

  describe('#removeTransactionHashFromWaitingList', () => {
    expect.fail();
    it('should remove data by block hash', () => {
      instantLocksCache.addTransaction(transactions[0]);
      instantLocksCache.addTransaction(transactions[1]);
      instantLocksCache.addTransaction(transactions[2]);
      instantLocksCache.addTransaction(transactions[3]);
      instantLocksCache.addTransaction(transactions[4]);
      instantLocksCache.addTransaction(transactions[5]);

      instantLocksCache.addBlock(blocks[0]);
      instantLocksCache.addBlock(blocks[1]);

      instantLocksCache.removeDataByBlockHash(blocks[0].hash);

      expect(instantLocksCache.transactions).to.deep.equal([
        { transaction: transactions[2], isRetrieved: false },
        { transaction: transactions[3], isRetrieved: false },
        { transaction: transactions[4], isRetrieved: false },
        { transaction: transactions[5], isRetrieved: false },
      ]);

      expect(instantLocksCache.merkleBlocks).to.deep.equal([
        { merkleBlock: merkleBlocks[1], isRetrieved: false },
      ]);

      expect(instantLocksCache.blocks).to.deep.equal(
        [blocks[1]],
      );
    });
  });
});
