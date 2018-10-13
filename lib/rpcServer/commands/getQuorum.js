const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getQuorum');

const validator = new Validator(argsSchema);
/**
 * @param coreApi
 * @return {getQuorum}
 */
const getQuorumFactory = (coreApi) => {
  /**
   * Returns user quorum (llmq)
   * @typedef fetchDapContract
   * @param args - command arguments
   * @param {string} args.dapId
   * @return {Promise<object>}
   */
  async function getQuorumContract(args) {
    validator.validate(args);
    const { regTxId } = args;
    return coreApi.getQuorum(regTxId);
  }

  return getQuorumContract;
};

module.exports = getQuorumFactory;
