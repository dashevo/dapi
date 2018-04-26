module.exports = {
  async estimateFee(numberOfBlocks) { return 1; },
  async getAddressSummary(address) { return {}; },
  async getAddressTotalReceived(address) { return 1000; },
  async getAddressTotalSent(address) { return 900; },
  async getAddressUnconfirmedBalance(address) { return 1100; },
  async getBalance(address) { return 100; },
  async getBestBlockHeight() { return 243789; },
  async getBlockHash() { return 'hash'; },
  async getBlocks(limit, blockDate) { return [{}]; },
  async getHistoricBlockchainDataSyncStatus() {
    return {};
  },
  async getMasternodesList() { return [{ ip: '127.0.0.1' }]; },
  async getRawBlock(blockHash) { return {}; },
  async getStatus(query) { return {}; },
  async getTransactionById(txid) { return {}; },
  async getTransactionsByAddress(address) { return []; },
  async getUser(usernameOrUserId) { return {}; },
  async getUTXO(address) { return []; },
  async sendRawTransaction(rawTransaction) { return 'txid'; },
  async generate(amount) { return new Array(amount); },
  async sendRawTransition(rawTransitionHeader) { return 'tsid'; },
};
