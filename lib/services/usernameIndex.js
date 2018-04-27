/**
 * @module usernameIndex
 * This module is a temporary solution until proper index in dashcore is provided.
 */

const { Registration } = require('@dashevo/dashcore-lib').Transaction.SubscriptionTransactions;
const union = require('lodash/union');
const EventEmitter = require('events');
const dashcore = require('../api/dashcore').rpc;
const log = require('../log');

let usernameCache = [];
let lastSeenBlock = 1;

const events = new EventEmitter();

async function processBlock(blockHeight) {
  const blockHash = await dashcore.getBlockHash(blockHeight);
  const block = await dashcore.getBlock(blockHash);
  let nextBlockExists = false;
  if (block) {
    log.info(`Processing block ${block.height}`);
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
      log.info(`${usernamesInBlock.length} usernames found: ${usernamesInBlock.join(', ')}`);
    } else {
      log.info('No usernames found.');
    }
  }
  events.emit('block_processed', nextBlockExists);
}

function updateUsernameIndex() {
  log.info('Updating username index...');
  return new Promise((resolve, reject) => {
    function blockHandler(isNextBlockExists) {
      if (isNextBlockExists) {
        lastSeenBlock += 1;
        processBlock(lastSeenBlock).catch(reject);
      } else {
        events.removeListener('block_processed', blockHandler);
        resolve();
      }
    }
    processBlock(lastSeenBlock).catch(reject);
    events.on('block_processed', blockHandler);
  });
}

async function searchUsernames(pattern) {
  await updateUsernameIndex();
  return usernameCache.filter(username => !!username.match(pattern));
}

module.exports = {
  searchUsernames,
};
