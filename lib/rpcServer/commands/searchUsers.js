const dashcore = require('../../api/dashcore').rpc;
const { Registration } = require('bitcore-lib-dash').Transaction.SubscriptionTransactions;
const union = require('lodash/union');

let usernameCache = [];
let lastSeenBlock = 1;
const maxLimit = 25;

async function indexUsernames() {
  console.warn('USERNAME INDEXER IS JUST FOR DEVELOPMENT PURPOSES, UNTIL PROPER DASHCORE RPC METHOD PROVIDED');
  console.log('Start username index');
  let nextBlockExists = true;
  let nextBlockHash = null;
  while (nextBlockExists) {
    const blockHash = nextBlockHash || await dashcore.getBlockHash(lastSeenBlock);
    const block = await dashcore.getBlock(blockHash);
    if (block) {
      lastSeenBlock = block.height;
      console.log(`Processing block ${block.height}`);
      nextBlockHash = block.nextblockhash || null;
      nextBlockExists = !!block.nextblockhash;
      const transactionHashes = block.tx;
      const transactions = await Promise
        .all(transactionHashes.map(transactionHash => dashcore.getTransaction(transactionHash)));
      const usernamesInBlock = transactions
        .map(rawTransaction => new Registration(rawTransaction.hex))
        .filter((regSubTx) => {
          try {
            const regData = regSubTx.getRegistrationData();
            return !!regData.username;
          } catch (e) {
            return false;
          }
        })
        .map(regSubTx => regSubTx.getRegistrationData().username);
      usernameCache = union(usernameCache, usernamesInBlock);
      if (usernamesInBlock.length) {
        console.log(`${usernamesInBlock.length} usernames found: ${usernamesInBlock.join(', ')}`);
      } else {
        // console.log('No regTx in block found');
      }
    } else {
      nextBlockExists = false;
    }
  }
}

/**
 * Returns user
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
    // TODO: This is workaround until we have proper index in dashcore
    await indexUsernames();
    console.log(usernameCache);
    const usernames = usernameCache.filter(username => !!username.match(pattern));
    return callback(null, {
      totalCount: usernames.length,
      results: usernames.slice(offset, offset + limit),
    });
  } catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = searchUsers;
