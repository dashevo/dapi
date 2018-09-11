module.exports = {
  async pinPacket(header, packet) { return 'tsid'; },
  async getDapSpace(dapId, userNameOrId) { return {}; },
  async getDapContext(dapId, usernameOrId) { return {}; },
  async fetchDapContract(dapId) { return {}; },
  async searchDapContracts(pattern) { return []; },
};
