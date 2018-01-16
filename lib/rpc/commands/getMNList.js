const insight = require('../../api/insight');

const getMNList = async function getMNList(args, callback) {
  try {
    const MNList = await insight.getMasternodesList();
    if (!MNList.length) {
      return callback({ code: 500, message: 'No active masternodes were found' });
    }
    return callback(null, MNList);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getMNList;
