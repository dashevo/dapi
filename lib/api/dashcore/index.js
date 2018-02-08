const config = require('../../config');
const RpcClient = require('bitcoind-rpc-dash');

const client = new RpcClient(config.dashcore.rpcClient);

const getBalance = adrArr => new Promise((resolve, reject) => {
  client.getReceivedByAddress(adrArr, (err, res) => {
    if (err) {
      reject(err);
    }
    resolve(res.result);
  });
});

module.exports = {
  getBalance,
};
