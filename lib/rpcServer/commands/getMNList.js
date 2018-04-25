const RPCError = require('../RPCError');
/**
 * @param coreAPI
 * @return {getMNList}
 */
const getMNListFactory = (coreAPI) => {
  /**
   * Returns masternode list
   * @return {Promise<object[]>}
   * @throws {RPCError}
   */
  async function getMNList() {
    try {
      const insightMNList = await coreAPI.getMasternodesList();
      return insightMNList.map(masternode => Object.assign(masternode, { ip: masternode.ip.split(':')[0] }));
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getMNList;
};

module.exports = getMNListFactory;
