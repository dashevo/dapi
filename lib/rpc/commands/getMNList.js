const insight = require('../../api/insight');

const getMNList = async (args, callback) => {
  try {
    const insightMNList = await insight.getMasternodesList();
    const MNList = insightMNList.map(masternode => Object.assign(masternode, { ip: masternode.ip.split(':')[0] }));
    return callback(null, MNList);
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getMNList;
