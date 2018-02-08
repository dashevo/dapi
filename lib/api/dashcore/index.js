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

/* eslint-disable */
module.exports = {
  getAddress,
  getCurrentBlockHeight,
  getHashFromHeight,
  getMnList,
  getUTXO,
  getBalance,
  sendRawTransition,
  sendRawTransaction,
  getUser,
  getBestBlockHeight,
  getBlockHash,
  getMasternodesList,
  getAddressTotalReceived,
  getBlocks,
  getAddressTotalSent,
  getAddressUnconfirmedBalance,
  getAddressAddress,
  getRawBlock,
};
