const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getUser');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @return {getUser}
 */
const getUserFactory = (coreAPI) => {
  /**
   * Returns blockchain user
   * @typedef getUser
   * @param args
   * @param {string} args.usernameOrRegTxId
   * @return {Promise<object>}
   */
  async function getUser(args) {
    validator.validate(args);
    const { usernameOrRegTxId } = args;
    return coreAPI.getUser(usernameOrRegTxId);
  }

  return getUser;
};

module.exports = getUserFactory;
