const { User } = require('@dashevo/dash-schema/lib').Consensus;

const log = require('../../log');
const insight = require('../../insight');

/**
 * Returns user
 * @param args
 * @param callback
 */
const getUser = async function getUser(args, callback) {
  const username = args[0];
  if (!User.validateUsername(username)) {
    return callback({ code: 400, message: 'Username is not valid' });
  }
  try {
    const user = await insight.getUser(username);
    // TODO: We need transition header
    // If we do not have any transitions just do not return last transition header
    return callback(null, user);
  } catch (e) {
    log.error(e.stack);
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getUser;
