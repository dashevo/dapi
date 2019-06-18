const { expect } = require('chai');

const TransactionHashesCache = require('../../../lib/transactionsFilter/TransactionHashesCache');

describe('TransactionHashesCache', () => {
  let transactions;
  let blocks;
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

    transactionHashesCache = new TransactionHashesCache();
  });

  describe('#addTransaction', () => {
    it('should add transaction hash with 0 linked blocks', () => {
      const [firstTx] = transactions;

      transactionHashesCache.addTransaction(firstTx);

      expect(transactionHashesCache.transactions).to.deep.equal({
        [firstTx.hash]: {
          transaction: firstTx,
          linkedBlockHashes: [],
        },
      });
    });
  });

  describe('#addBlock', () => {
    it('should add a block and link any matched transaction', () => {
      const [tx] = transactions;
      const [block] = blocks;

      transactionHashesCache.addTransaction(tx);
      transactionHashesCache.addBlock(block);

      expect(transactionHashesCache.transactions[tx.hash].linkedBlockHashes).to.deep.equal(
        [block.hash],
      );
    });

    it('should add a block and not link unmatched transactions', () => {
      const [tx] = transactions;
      const [, block] = blocks;

      transactionHashesCache.addTransaction(tx);
      transactionHashesCache.addBlock(block);

      expect(transactionHashesCache.transactions[tx.hash].linkedBlockHashes).to.have.a.lengthOf(0);
    });

    it('should remove blocks if cache size is reached', () => {
      transactionHashesCache.cacheSize = 2;

      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);

      expect(transactionHashesCache.blocks).to.deep.equal(
        [blocks[0], blocks[1]],
      );

      transactionHashesCache.addBlock(blocks[2]);

      expect(transactionHashesCache.blocks).to.deep.equal(
        [blocks[1], blocks[2]],
      );
    });

    it('should remove orphaned transactions', () => {
      transactionHashesCache.cacheSize = 2;

      transactions.forEach(tx => transactionHashesCache.addTransaction(tx));

      const [, , txThree, txFour, txFive, txSix] = transactions;

      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);
      transactionHashesCache.addBlock(blocks[2]);

      expect(transactionHashesCache.transactions).to.deep.equal({
        [txThree.hash]: {
          transaction: txThree,
          linkedBlockHashes: [blocks[1].hash],
        },
        [txFour.hash]: {
          transaction: txFour,
          linkedBlockHashes: [blocks[1].hash],
        },
        [txFive.hash]: {
          transaction: txFive,
          linkedBlockHashes: [blocks[2].hash],
        },
        [txSix.hash]: {
          transaction: txSix,
          linkedBlockHashes: [blocks[2].hash],
        },
      });
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

  describe('#getUnmatchedBlocks', () => {
    it('should return blocks with unmatched hashes', () => {
      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[1]);
      transactionHashesCache.addBlock(blocks[2]);

      const blocksReturned = transactionHashesCache.getUnmatchedBlocks([
        blocks[0].hash,
      ]);

      expect(blocksReturned).to.deep.equal(
        [blocks[1], blocks[2]],
      );
    });
  });

  describe('#getMatchedTransactions', () => {
    it('should return matched transactions', () => {
      transactionHashesCache.addTransaction(transactions[0]);
      transactionHashesCache.addTransaction(transactions[3]);

      transactionHashesCache.addBlock(blocks[0]);

      const result = transactionHashesCache.getMatchedTransactions(blocks[0]);

      expect(result).to.deep.equal([transactions[0]]);
    });

    it('should not return matched transactions with more than 1 linked block', () => {
      transactionHashesCache.addTransaction(transactions[0]);
      transactionHashesCache.addTransaction(transactions[3]);

      transactionHashesCache.addBlock(blocks[0]);
      transactionHashesCache.addBlock(blocks[3]);

      const result = transactionHashesCache.getMatchedTransactions(blocks[3]);

      expect(result).to.have.lengthOf(0);
    });
  });
});
