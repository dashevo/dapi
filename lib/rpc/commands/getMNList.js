const insight = require('../../api/insight');

const getMNList = async function getMNList(args, callback) {
  try {
    const insightMNList = await insight.getMasternodesList();
    const MNList = insightMNList.map(masternode => Object.assign({}, masternode, { ip: masternode.ip.split(':')[0] }));
    return callback(null, MNList);
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getMNList;
