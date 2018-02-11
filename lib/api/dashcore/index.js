const config = require('../../config');
const RpcClient = require('bitcoind-rpc-dash');

const client = new RpcClient(config.dashcore.rpcClient);

module.exports = {
  // getAddress,
  // getCurrentBlockHeight,
  // getHashFromHeight,
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
