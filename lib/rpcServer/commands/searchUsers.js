const usernameIndex = require('../../services/usernameIndex');

const maxLimit = 25;

/**
 * Returns list of usernames matching given pattern
 * @param args
 * @param callback
 */
const searchUsers = async (args, callback) => {
  try {
    const pattern = args[0] || args.pattern;
    let limit = args[1] || args.limit;
    let offset = args[2] || args.offest;
    if (typeof limit !== 'number' || limit > 25 || limit < 0) {
      limit = maxLimit;
    }
    if (typeof offset !== 'number' || offset < 0) {
      offset = 0;
    }
    const usernames = await usernameIndex.searchUsernames(pattern);
    return callback(null, {
      totalCount: usernames.length,
      results: usernames.slice(offset, offset + limit),
    });
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = searchUsers;
