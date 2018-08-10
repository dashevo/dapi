const config = require('../../config');
const RpcClient = require('@dashevo/dashd-rpc');
const constants = require('./constants');

const client = new RpcClient(config.dashcore.rpc);

const getTransactionFirstInputAddress = txId => new Promise((resolve, reject) => {
  client.getTransaction(txId, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.details.address);
    }
  });
});

const getCurrentBlockHeight = () => new Promise((resolve, reject) => {
  client.getBlockCount((err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getHashFromHeight = height => new Promise((resolve, reject) => {
  client.getBlockHash(height, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getMasternodesList = () => new Promise((resolve, reject) => {
  client.masternodelist((err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getMnListDiff = (baseBlockHash, blockHash) => new Promise((resolve, reject) => {
  client.protx(constants.DASHCORE_RPC_COMMANDS.protx.diff, baseBlockHash, blockHash, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

// Address indexing needs to be enabled
// (todo getting invalid address, perhaps this should be in SDK)
const getUTXO = addr => new Promise((resolve, reject) => {
  client.getaddressutxos(addr, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

// Address indexing needs to be enabled
// (todo getting invalid address, perhaps this should be in SDK)
const getBlockHash = index => new Promise((resolve, reject) => {
  client.getblockhash(index, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getBlock = (hash, isParsed = 1) => new Promise((resolve, reject) => {
  client.getblock(hash, isParsed, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getTransaction = txid => new Promise((resolve, reject) => {
  client.gettransaction(txid, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getTransition = tsid => new Promise((resolve, reject) => {
  client.gettransition(tsid, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});


const getRawTransaction = txid => new Promise((resolve, reject) => {
  client.getrawtransaction(txid, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getRawBlock = txid => getBlock(txid, false);

const sendRawTransaction = tx => new Promise((resolve, reject) => {
  client.sendrawtransaction(tx, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const sendRawTransition = ts => new Promise((resolve, reject) => {
  client.sendRawTransaction(ts, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const getUser = tx => new Promise((resolve, reject) => {
  client.getuser(tx, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

const generate = amount => new Promise((resolve, reject) => {
  client.generate(amount, (err, r) => {
    if (err) {
      reject(err);
    } else {
      resolve(r.result);
    }
  });
});

module.exports = {
  getTransactionFirstInputAddress,
  getCurrentBlockHeight,
  getHashFromHeight,
  getUTXO,
  getMasternodesList,
  getMnListDiff,
  sendRawTransition,
  sendRawTransaction,
  getUser,
  getBlockHash,
  getBlock,
  getTransaction,
  getTransition,
  getRawTransaction,
  getRawBlock,
  generate,
};
