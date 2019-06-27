const { MerkleBlock } = require('@dashevo/dashcore-lib');

class TransactionHashesCache {
  constructor() {
    this.transactions = [];
    this.merkleBlocks = [];
    this.blocks = [];
    this.cacheSize = 10;
  }

  /**
   * Add a transaction if previously not added before
   *
   * @param {Transaction} transaction
   *
   * @returns {void}
   */
  addTransaction(transaction) {
    const isAdded = this.transactions
      .filter(({ transaction: tx }) => tx.hash === transaction.hash)
      .length > 0;

    if (isAdded) {
      return;
    }

    this.transactions.push({
      transaction,
      isSent: false,
    });
  }

  /**
   * Add a block
   *
   * @param {Block} block
   *
   * @returns {void}
   */
  addBlock(block) {
    const blockTransactionHashes = block.transactions.map(tx => tx.hash);
    const cacheTransactionHashes = this.transactions
      .map(({ transaction }) => transaction.hash);

    let haveMatchingTransactions = false;
    const matchedTransactionFlags = blockTransactionHashes
      .map((hash) => {
        const isIncluded = cacheTransactionHashes.includes(hash);

        if (!haveMatchingTransactions && isIncluded) {
          haveMatchingTransactions = true;
        }

        return isIncluded;
      });

    if (!haveMatchingTransactions) {
      return;
    }

    const merkleBlock = MerkleBlock.build(
      block.header,
      blockTransactionHashes,
      matchedTransactionFlags,
    );

    // Push the block to the cache
    this.merkleBlocks.push({
      merkleBlock,
      isSent: false,
    });

    this.blocks.push(block);

    if (this.blocks.length > this.cacheSize) {
      // Shift an array keeping cache within size constraints
      const firstBlock = this.blocks.shift();

      this.removeDataByBlock(firstBlock);
    }
  }

  /**
   * Remove transactions, block and merkleBlock
   *
   * @param {string} blockHash
   */
  removeDataByBlockHash(blockHash) {
    const [block] = this.blocks.filter(b => b.hash === blockHash);

    if (block) {
      this.removeDataByBlock(block);
    }
  }

  /**
   * @private
   *
   * Removes data by block
   *
   * @param {Block} block
   */
  removeDataByBlock(block) {
    const blockTransactionHashes = block.transactions
      .map(tx => tx.hash);

    // Removing matching transactions
    for (let i = this.transactions.length - 1; i >= 0; i--) {
      const { transaction } = this.transactions[i];
      if (blockTransactionHashes.includes(transaction.hash)) {
        this.transactions.splice(i, 1);
      }
    }

    // Removing merkle block
    for (let i = this.merkleBlocks.length - 1; i >= 0; i--) {
      const { merkleBlock } = this.merkleBlocks[i];
      if (merkleBlock.header.hash === block.hash) {
        this.merkleBlocks.splice(i, 1);
        break;
      }
    }

    // Removing block
    for (let i = this.blocks.length - 1; i >= 0; i--) {
      const cachedBlock = this.blocks[i];
      if (cachedBlock.hash === block.hash) {
        this.blocks.splice(i, 1);
        break;
      }
    }
  }

  /**
   * Get block count
   *
   * @returns {int}
   */
  getBlockCount() {
    return this.blocks.length;
  }

  /**
   * Get unsent transactions
   *
   * @returns {Transaction[]}
   */
  getUnsentTransactions() {
    const unsentTransactions = this.transactions
      .filter(({ isSent }) => !isSent);

    // mark transactions as sent
    unsentTransactions.forEach((tx) => {
      // eslint-disable-next-line no-param-reassign
      tx.isSent = true;
    });

    return unsentTransactions.map(({ transaction }) => transaction);
  }

  /**
   * Get unsent merkle blocks
   *
   * @returns {MerkleBlock[]}
   */
  getUnsentMerkleBlocks() {
    const unsentMerkleBlocks = this.merkleBlocks
      .filter(({ isSent }) => !isSent);

    // mark merkle blocks as sent
    unsentMerkleBlocks.forEach((merkleBlock) => {
      // eslint-disable-next-line no-param-reassign
      merkleBlock.isSent = true;
    });

    return unsentMerkleBlocks.map(({ merkleBlock }) => merkleBlock);
  }
}

module.exports = TransactionHashesCache;
