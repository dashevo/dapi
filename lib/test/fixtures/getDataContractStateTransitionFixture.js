const DashPlatformProtocol = require('@dashevo/dpp');

/**
 * @param {DataContract} dataContract
 * @returns {DataContractStateTransition|DocumentsStateTransition}
 */
async function getDataContractStateTransitionFixture(dataContract) {
  const dpp = new DashPlatformProtocol();

  return dpp.dataContract.createStateTransition(dataContract);
}

module.exports = getDataContractStateTransitionFixture;
