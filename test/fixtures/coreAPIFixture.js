module.exports = {
  async estimateFee(numberOfBlocks) { return 1; },
  async getAddressSummary(address) { return {}; },
  async getAddressTotalReceived(address) { return 1000; },
  async getAddressTotalSent(address) { return 900; },
  async getAddressUnconfirmedBalance(address) { return 1100; },
  async getBalance(address) { return 100; },
  async getBestBlockHeight() { return 243789; },
  async getBlockHash() { return 'hash'; },
  async getBlockHeaders() { return [{}]; },
  async getBlockHeader() { return {}; },
  async getBlocks(blockDate, limit) { return [{}]; },
  async getHistoricBlockchainDataSyncStatus() {
    return {};
  },
  async getMasternodesList() { return [{ ip: '127.0.0.1' }]; },
  async getPeerDataSyncStatus() { return ''; },
  async getMnListDiff() {
    return {
      baseBlockHash: '0000000000000000000000000000000000000000000000000000000000000000',
      blockHash: '0000000000000000000000000000000000000000000000000000000000000000',
      deletedMNs: [],
      mnList: [],
      merkleRootMNList: '0000000000000000000000000000000000000000000000000000000000000000',
    };
  },
  async getRawBlock(blockHash) { return {}; },
  async getStatus(query) { return {}; },
  async getTransactionById(txid) { return {}; },
  async getTransactionsByAddress(address) { return []; },
  async getUser(usernameOrUserId) { return {}; },
  async getUTXO(address) { return []; },
  async sendRawTransaction(rawTransaction) { return 'txid'; },
  async sendRawIxTransaction(rawTransaction) { return 'txid'; },
  async generate(amount) { return new Array(amount); },
  async sendRawTransition(rawTransitionHeader) { return 'tsid'; },
  // Todo: not yet final spec so it may change
  async getQuorum() {
    return {
      quorum: [
        {
          proRegTxHash: 'f7737beb39779971e9bc59632243e13fc5fc9ada93b69bf48c2d4c463296cd5a',
          service: '207.154.244.13:19999',
          keyIDOperator: '43ce12751c4ba45dcdfe2c16cefd61461e17a54d',
          keyIDVoting: '43ce12751c4ba45dcdfe2c16cefd61461e17a54d',
          isValid: true,
        },
      ],
      proofs: {
        merkleHashes: ['71e9bc59632243e13f2d4c463296cd5a7737beb397799fc5fc9ada93b69bf48c'],
        merkleFlags: 0x1d,
      }
      ,
    };
  },
};
