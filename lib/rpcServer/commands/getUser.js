const { validate } = require('@dashevo/dash-schema/lib');

const insight = require('../../api/insight');

/**
 * Returns user
 * @param args
 * @param callback
 */
const getUser = async (args, callback) => {
  try {
    const usernameOrRegTxId = args[0];
    if (!validate.username(usernameOrRegTxId).valid) {
      return callback({ code: 400, message: 'Username is not valid' });
    }
    const user = await insight.getUser(usernameOrRegTxId);
    return callback(null, user);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getUser;
