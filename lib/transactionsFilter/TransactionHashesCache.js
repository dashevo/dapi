class TransactionHashesCache {
  constructor() {
    this.transactions = [];
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
    this.transactions.push({
      transaction,
      linkedBlockHashes: [],
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
    const blockHash = block.hash;

    const blockTransactionHashes = block.transactions.map(t => t.hash);

    // Get transactions that current block contains
    const matchedTransactions = this.transactions
      .filter(tx => blockTransactionHashes.includes(tx.transaction.hash));

    // Link transaction to the current block hash
    matchedTransactions.forEach(tx => tx.transaction.linkedBlockHashes.push(blockHash));

    this.blocks.push(block);

    if (this.blocks.length > this.cacheSize) {
      // Get block hash to remove
      const [{ hash: firstBlockHash }] = this.blocks;

      // Get all linked to this hash transactions
      const linkedTransactions = this.transactions
        .filter(tx => tx.linkedBlockHashes.includes(firstBlockHash));

      // Get all transaction indexes that are linked only to one block
      const transactionsToRemove = linkedTransactions
        .filter(tx => tx.linkedBlockHashes.length === 1)
        .map(tx => this.transactions.indexOf(tx));

      // Remove first block hash from other linked transactions
      linkedTransactions.forEach((tx) => {
        const index = tx.linkedBlockHashes.indexOf(firstBlockHash);
        tx.linkedBlockHashes.splice(index, 1);
      });

      // Remove transaction from cache
      transactionsToRemove.forEach(index => this.transactions.splice(index, 1));

      // Shift an array keeping cache within size constraints
      this.blocks.shift();
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
    return this.transactions
      .filter(tx => tx.linkedBlockHashes.includes(block.hash))
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
    return this.transactions
      .filter(tx => tx.transaction.hash === hash)
      .length > 0;
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
   * Get all matching transactions
   *
   * @param {Block} block
   *
   * @return {Transaction[]}
   */
  getMatchedTransactions(block) {
    return this.transactions
      .filter(tx => tx.linkedBlockHashes.includes(block.hash))
      .map(tx => tx.transaction);
  }
}

module.exports = TransactionHashesCache;
