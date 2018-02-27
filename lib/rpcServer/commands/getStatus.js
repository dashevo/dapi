const insight = require('../../api/insight');

const getStatus = async (args, callback) => {
  try {
    const queryString = args[0] || args.queryString;
    return callback(null, await insight.getStatus(queryString));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getStatus;
