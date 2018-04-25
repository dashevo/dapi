const RPCError = require('../RPCError');
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
   * @param {object} args
   * @param {string} [args.username]
   * @param {string} [args.userId]
   * @return {Promise<object>}
   * @throws {RPCError}
   */
  async function getUser(args) {
    try {
      validator.validate(args);
      const usernameOrId = args[0] || args.username || args.userId;
      const user = await coreAPI.getUser(usernameOrId);
      return user;
    } catch (error) {
      throw new RPCError(400, error.message);
    }
  }
  return getUser;
};

module.exports = getUserFactory;
