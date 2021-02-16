class AbstractTransactionResult {
  /**
   * @param {Object} result
   */
  constructor(result) {
    this.result = result;
  }

  /**
   * Get result
   *
   * @return {Object}
   */
  getResult() {
    return this.result;
  }
}

module.exports = AbstractTransactionResult;
