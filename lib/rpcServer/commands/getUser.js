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
   * @param {string} [args.username]
   * @param {string} [args.userId]
   * @return {Promise<object>}
   */
  async function getUser(args) {
    validator.validate(args);
    const usernameOrId = args[0] || args.username || args.userId;
    return coreAPI.getUser(usernameOrId);
  }

  return getUser;
};

module.exports = getUserFactory;
