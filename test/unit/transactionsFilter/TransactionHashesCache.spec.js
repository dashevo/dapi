const { expect } = require('chai');

const TransactionHashesCache = require('../../../lib/transactionsFilter/TransactionHashesCache');

describe('TransactionHashesCache', () => {
  let transactions;
  let blocks;
  let merkleBlocks;
  let transactionHashesCache;

  beforeEach(() => {
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
      },
      {
        hash: '000000000000000000000000000000000000000000000000000000000000002b',
        transactions: [transactions[2], transactions[3]],
      },
      {
        hash: '000000000000000000000000000000000000000000000000000000000000003b',
        transactions: [transactions[4], transactions[5]],
      },

      {
        hash: '000000000000000000000000000000000000000000000000000000000000004b',
        transactions: [transactions[0], transactions[1]],
      },
    ];

    merkleBlocks = blocks.map(block => ({ header: { hash: block.hash } }));

    transactionHashesCache = new TransactionHashesCache();
  });

  describe('#addTransaction', () => {
    it('should add transaction', () => {
      const [firstTx] = transactions;

      transactionHashesCache.addTransaction(firstTx);

      expect(transactionHashesCache.transactions).to.deep.equal({
        [firstTx.hash]: firstTx,
      });
    });
  });

  describe('#addMerkleBlock', () => {
    it('should add merkle block', () => {
      const [merkleBlock] = merkleBlocks;

      transactionHashesCache.addMerkleBlock(merkleBlock);

      expect(transactionHashesCache.merkleBlocks).to.deep.equal({
        [merkleBlock.header.hash]: merkleBlock,
      });
    });
  });

  describe('#addBlock', () => {
    it('should add a block', () => {
      const [block] = blocks;

      transactionHashesCache.addBlock(block);

      expect(transactionHashesCache.blocks).to.deep.equal(
        [block],
      );
    });

    it('should remove data if cache size is reached', () => {
      transactionHashesCache.cacheSize = 2;

      transactionHashesCache.addTransaction(transactions[0]);
      transactionHashesCache.addTransaction(transactions[1]);
      transactionHashesCache.addTransaction(transactions[2]);
      transactionHashesCache.addTransaction(transactions[3]);
      transactionHashesCache.addTransaction(transactions[4]);
      transactionHashesCache.addTransaction(transactions[5]);

      transactionHashesCache.addMerkleBlock(merkleBlocks[0]);
      transactionHashesCache.addMerkleBlock(merkleBlocks[1]);

      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);
      transactionHashesCache.addBlock(blocks[2]);

      expect(transactionHashesCache.transactions).to.deep.equal(
        {
          [transactions[2].hash]: transactions[2],
          [transactions[3].hash]: transactions[3],
          [transactions[4].hash]: transactions[4],
          [transactions[5].hash]: transactions[5],
        },
      );

      expect(transactionHashesCache.merkleBlocks).to.deep.equal(
        {
          [merkleBlocks[1].header.hash]: merkleBlocks[1],
        },
      );

      expect(transactionHashesCache.blocks).to.deep.equal(
        [blocks[1], blocks[2]],
      );
    });
  });

  describe('#hasMatchedTransactions', () => {
    it('should indicate if cache has matched transactions', () => {
      let result = transactionHashesCache.hasMatchedTransactions(blocks[0]);

      expect(result).to.equal(false);

      transactionHashesCache.addTransaction(transactions[0]);

      result = transactionHashesCache.hasMatchedTransactions(blocks[0]);

      expect(result).to.equal(true);
    });
  });

  describe('#hasTransactionHash', () => {
    it('should indicate if cache has transactions by hash', () => {
      let result = transactionHashesCache.hasTransactionHash(transactions[0].hash);

      expect(result).to.equal(false);

      transactionHashesCache.addTransaction(transactions[0]);

      result = transactionHashesCache.hasTransactionHash(transactions[0].hash);

      expect(result).to.equal(true);
    });
  });

  describe('#getBlockCount', () => {
    it('should return block count', () => {
      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);

      expect(transactionHashesCache.getBlockCount()).to.equal(2);
    });
  });

  describe('#removeDataByBlockHash', () => {
    it('should remove data by block hash', () => {
      transactionHashesCache.addTransaction(transactions[0]);
      transactionHashesCache.addTransaction(transactions[1]);
      transactionHashesCache.addTransaction(transactions[2]);
      transactionHashesCache.addTransaction(transactions[3]);
      transactionHashesCache.addTransaction(transactions[4]);
      transactionHashesCache.addTransaction(transactions[5]);

      transactionHashesCache.addMerkleBlock(merkleBlocks[0]);
      transactionHashesCache.addMerkleBlock(merkleBlocks[1]);

      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);

      transactionHashesCache.removeDataByBlockHash(blocks[0].hash);

      expect(transactionHashesCache.transactions).to.deep.equal(
        {
          [transactions[2].hash]: transactions[2],
          [transactions[3].hash]: transactions[3],
          [transactions[4].hash]: transactions[4],
          [transactions[5].hash]: transactions[5],
        },
      );

      expect(transactionHashesCache.merkleBlocks).to.deep.equal(
        {
          [merkleBlocks[1].header.hash]: merkleBlocks[1],
        },
      );

      expect(transactionHashesCache.blocks).to.deep.equal(
        [blocks[1]],
      );
    });
  });

  describe('#getDataGroupedByBlock', () => {
    it('should return grouped data by blocks that have merkle blocks', () => {
      transactionHashesCache.addTransaction(transactions[2]);
      transactionHashesCache.addTransaction(transactions[3]);
      transactionHashesCache.addTransaction(transactions[4]);
      transactionHashesCache.addTransaction(transactions[5]);

      transactionHashesCache.addMerkleBlock(merkleBlocks[1]);

      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);

      const data = transactionHashesCache.getDataGroupedByBlock();

      expect(data).to.deep.equal([{
        merkleBlock: merkleBlocks[1],
        transactions: [
          transactions[2],
          transactions[3],
        ]
      }]);
    });
  });
});
