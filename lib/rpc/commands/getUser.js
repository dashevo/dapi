// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const { User } = require('@dashevo/dash-schema/lib').Consensus;

const insight = require('../../api/insight');

/**
 * Returns user
 * @param args
 * @param callback
 */
const getUser = async function getUser(args, callback) {
  try {
    const usernameOrRegTxId = args[0];
    if (!User.validateUsername(usernameOrRegTxId)) {
      return callback({ code: 400, message: 'Username is not valid' });
    }
    const user = await insight.getUser(usernameOrRegTxId);
    // TODO: We need transition header
    // If we do not have any transitions just do not return last transition header
    return callback(null, user);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getUser;
