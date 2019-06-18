class TransactionHashesCache {
  constructor() {
    this.transactions = {};
    this.blocks = [];
    this.cacheSize = 10;
  }

  /**
   * Add a transaction
   *
   * @param {Transaction} transaction
   *
   * @returns {void}
   */
  addTransaction(transaction) {
    this.transactions[transaction.hash] = {
      transaction,
      linkedBlockHashes: [],
    };
  }

  /**
   * Add a block
   *
   * @param {Block} block
   *
   * @returns {void}
   */
  addBlock(block) {
    const blockHash = block.hash;

    // Link matched transaction to a block
    block.transactions
      .forEach((tx) => {
        if (this.transactions[tx.hash] != null) {
          this.transactions[tx.hash].linkedBlockHashes.push(blockHash);
        }
      });

    // Push the block to the cache
    this.blocks.push(block);

    if (this.blocks.length > this.cacheSize) {
      // Shift an array keeping cache within size constraints
      this.blocks.shift();

      const blockHashes = this.blocks.map(b => b.hash);

      // Remove orphaned transactions
      const orphanedTxHashes = Object.entries(this.transactions)
        .filter(
          ([, { linkedBlockHashes }]) => linkedBlockHashes
            .reduce(
              (acc, hash) => !blockHashes.includes(hash) && acc,
              linkedBlockHashes.length > 0,
            ),
        )
        .map(([txHash]) => txHash);

      orphanedTxHashes.forEach(hash => delete this.transactions[hash]);
    }
  }

  /**
   * Check if cache has transactions linked to block
   *
   * @param {Block} block
   *
   * @returns {boolean}
   */
  hasMatchedTransactions(block) {
    const blockTxHashes = block.transactions.map(tx => tx.hash);
    return Object.keys(this.transactions)
      .filter(txHash => blockTxHashes.includes(txHash))
      .length > 0;
  }

  /**
   * Check of cache has transaction with hash
   *
   * @param {string} hash
   *
   * @returns {boolean}
   */
  hasTransactionHash(hash) {
    return this.transactions[hash] != null;
  }

  /**
   * Get unmatched blocks
   *
   * @param {string[]} blockHashes
   *
   * @returns {Block[]}
   */
  getUnmatchedBlocks(blockHashes) {
    return this.blocks.filter(block => !blockHashes.includes(block.hash));
  }

  /**
   * Get all matching transactions that have not been participating in reorg
   *
   * @param {Block} block
   *
   * @return {Transaction[]}
   */
  getMatchedTransactions(block) {
    const blockTxHashes = block.transactions.map(tx => tx.hash);
    return blockTxHashes
      .filter(txHash => this.hasTransactionHash(txHash)
        && this.transactions[txHash].linkedBlockHashes.length === 1)
      .map(txHash => this.transactions[txHash].transaction);
  }
}

module.exports = TransactionHashesCache;
