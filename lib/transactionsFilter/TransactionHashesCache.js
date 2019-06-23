class TransactionHashesCache {
  constructor() {
    this.transactions = {};
    this.blocks = [];
    this.merkleBlocks = {};
    this.cacheSize = 10;
  }

  /**
   * Add a transaction if previously not added before
   *
   * @param {Transaction} transaction
   *
   * @returns {boolean}
   */
  addTransaction(transaction) {
    if (this.transactions[transaction.hash] != null) {
      return false;
    }

    this.transactions[transaction.hash] = transaction;

    return true;
  }

  /**
   * Add a block
   *
   * @param {Block} block
   *
   * @returns {void}
   */
  addBlock(block) {
    // Push the block to the cache
    this.blocks.push(block);

    if (this.blocks.length > this.cacheSize) {
      // Shift an array keeping cache within size constraints
      const firstBlock = this.blocks.shift();

      // Removing matching transactions
      firstBlock.transactions
        .forEach(tx => delete this.transactions[tx.hash]);

      // Removing merkle block
      delete this.merkleBlocks[firstBlock.hash];
    }
  }

  /**
   * Store merkle block in a cache
   *
   * @param {MerkleBlock} merkleBlock
   *
   * @returns {void}
   */
  addMerkleBlock(merkleBlock) {
    this.merkleBlocks[merkleBlock.header.hash] = merkleBlock;
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
   * Remove transactions, block and merkleBlock
   *
   * @param {string} blockHash
   */
  removeDataByBlockHash(blockHash) {
    const [block] = this.blocks.filter(b => b.hash === blockHash);

    // remove transactions
    block.transactions
      .forEach(tx => delete this.transactions[tx.hash]);

    // Removing merkle block
    delete this.merkleBlocks[blockHash];

    const blockIndex = this.blocks.indexOf(block);

    // Remove the block
    this.blocks.splice(blockIndex, 1);
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
   * Get all unsent transactions and merkle blocks grouped
   *
   * @returns {{merkleBlock: MerkleBlock, transactions: Transaction[]}[]}
   */
  getDataGroupedByBlock() {
    return this.blocks
      // filter all block that have a merkle block
      .filter(block => this.merkleBlocks[block.hash] != null)
      // prepare the results
      .map((block) => {
        const transactions = block.transactions
          .filter(tx => this.transactions[tx.hash] != null);

        const merkleBlock = this.merkleBlocks[block.hash];

        return {
          transactions,
          merkleBlock,
        };
      });
  }
}

module.exports = TransactionHashesCache;
