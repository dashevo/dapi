const EventEmitter = require('events');
const chai = require('chai');
const userIndex = require('../../../lib/services/userIndex');

const { expect } = chai;

const rpcMock = {
  maxBlock: 3,
  async getBestBlockHeight() { return this.maxBlock; },
  async getBlockHash(blockHeight) {
    if (blockHeight > await this.getBestBlockHeight()) {
      throw new Error('Block height out of range');
    }
    return `${blockHeight}`;
  },
  async getBlockHeight(blockHash) {
    const height = Number(blockHash);
    if (height > await this.getBestBlockHeight()) {
      throw new Error('Block hash out of range');
    }
    return height;
  },
  async getBlock(blockHash) {
    const height = await this.getBlockHeight(blockHash);
    if (height > await this.getBestBlockHeight()) {
      throw new Error('Block out of range');
    }
    const isBestBlock = height >= await this.getBestBlockHeight();
    const nextBlockHash = isBestBlock ? null : await this.getBlockHash(height + 1);
    return {
      height,
      nextblockhash: nextBlockHash,
      tx: [],
    };
  },
  getUser(txId) { throw new Error('Not found'); },
};

const zmqMock = new EventEmitter();
zmqMock.topics = { hashblock: 'hashblock' };

describe('userIndex', () => {
  it('Should not throw out of range error', () => {
    userIndex.start({ dashCoreRpcClient: rpcMock, dashCoreZmqClient: zmqMock, log: console });
  });
});
