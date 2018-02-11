const config = require('../../config');
const RpcClient = require('bitcoind-rpc-dash');

const client = new RpcClient(config.dashcore.rpcClient);

const getAddress = txId => new Promise((resolve, reject) => {
  client.getTransaction(txId, (err, r) => {
    if (err) {
      reject(err);
    }
    resolve(r.details.address);
  });
});

const getCurrentBlockHeight = () => new Promise((resolve, reject) => {
  client.getBlockCount((err, r) => {
    if (err) {
      reject(err);
    }
    resolve(r.result);
  });
});

const getHashFromHeight = height => new Promise((resolve, reject) => {
  client.getBlockHash(height, (err, r) => {
    if (err) {
      reject(err);
    }
    resolve(r.result);
  });
});

module.exports = {
  getAddress,
  getCurrentBlockHeight,
  getHashFromHeight,
  // getMnList,
  // getMnUpdateList,
  // request,
  // getUTXO,
  // sendRawTransition,
  // sendRawTransaction,
  // getUser,
  // getBestBlockHeight,
  // getBlockHash,
  // getMasternodesList,
  // getAddressTotalReceived,
  // getBlocks,
  // getAddressTotalSent,
  // getAddressUnconfirmedBalance,
  // getAddressAddress,
  // getRawBlock,
};
