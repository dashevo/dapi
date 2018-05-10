module.exports = {
  async pinPacket(header, packet) { return 'tsid'; },
  async getDapSpace(dapId, userNameOrId) { return {}; },
  async getDapContext(dapId, usernameOrId) { return {}; },
  async getDapContract(dapId) { return {}; },
};
