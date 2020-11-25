const {
  Transaction,
  Block,
  BlockHeader,
  MerkleBlock,
  PrivateKey,
  BloomFilter,
  InstantLock,
  util: { buffer: BufferUtils },
} = require('@dashevo/dashcore-lib');

const BloomFilterEmitterCollection = require('../../../lib/bloomFilter/emitter/BloomFilterEmitterCollection');
const ProcessMediator = require('../../../lib/transactionsFilter/ProcessMediator');

const subscribeToNewTransactions = require('../../../lib/transactionsFilter/subscribeToNewTransactions');
const testTransactionsAgainstFilter = require('../../../lib/transactionsFilter/testTransactionAgainstFilter');

/**
 * Reverse the hash
 *
 * @param {string} hash
 * @returns {string}
 */
function reverseHash(hash) {
  return BufferUtils.reverse(
    Buffer.from(hash, 'hex'),
  ).toString('hex');
}

describe('subscribeToNewTransactions', () => {
  let bloomFilter;
  let bloomFilterEmitterCollection;
  let mediator;
  let transactions;
  let blocks;
  let instantLocks;

  beforeEach(() => {
    const address = new PrivateKey().toAddress();
    const anotherAddress = new PrivateKey().toAddress();

    transactions = [];
    transactions.push(new Transaction().to(address, 41));
    transactions.push(new Transaction().to(address, 42));
    transactions.push(new Transaction().to(anotherAddress, 43));

    transactions.push(new Transaction().to(address, 77));
    transactions.push(new Transaction().to(anotherAddress, 78));

    const blockHeaderOne = new BlockHeader({
      version: 536870913,
      prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
      merkleRoot: 'c4970326400177ce67ec582425a698b85ae03cae2b0d168e87eed697f1388e4b',
      time: 1507208925,
      timestamp: 1507208645,
      bits: '1d00dda1',
      nonce: 1449878272,
    });

    const blockOne = new Block({
      header: blockHeaderOne.toObject(),
      transactions: [transactions[0], transactions[1], transactions[2]],
    });

    const blockHeaderTwo = new BlockHeader({
      version: 536870913,
      prevHash: blockOne.hash,
      merkleRoot: 'c4970326400177ce67ec582425a698b85ae03cae2b0d168e87eed697f1388e4c',
      time: 1507208926,
      timestamp: 1507208645,
      bits: '1d00dda1',
      nonce: 1449878272,
    });

    const blockTwo = new Block({
      header: blockHeaderTwo.toObject(),
      transactions: [transactions[3], transactions[4]],
    });

    blocks = [];
    blocks.push(blockOne);
    blocks.push(blockTwo);

    const instantLockOne = InstantLock.fromObject({
      inputs: [
        {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 0,
        },
      ],
      txid: 'becccaf1f99d7e7a8a4cc02d020e73d96858757037fca99758bfd629d235bbba',
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80',
    });
    const instantLockTwo = InstantLock.fromObject({
      inputs: [
        {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 0,
        },
      ],
      txid: 'todo',
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80',
    });

    instantLocks.push(instantLockOne);
    instantLockTwo.push(instantLockTwo);

    bloomFilter = BloomFilter.create(1, 0.0001);
    bloomFilter.insert(address.hashBuffer);

    bloomFilterEmitterCollection = new BloomFilterEmitterCollection();
    mediator = new ProcessMediator();
  });

  it('should add transactions and blocks in cache and send them back when historical data is sent', () => {
    const receivedTransactions = [];
    const receivedBlocks = [];

    mediator.on(ProcessMediator.EVENTS.TRANSACTION, (tx) => {
      receivedTransactions.push(tx);
    });

    mediator.on(ProcessMediator.EVENTS.MERKLE_BLOCK, (merkleBlock) => {
      receivedBlocks.push(merkleBlock);
    });

    subscribeToNewTransactions(
      mediator,
      bloomFilter,
      testTransactionsAgainstFilter,
      bloomFilterEmitterCollection,
    );

    bloomFilterEmitterCollection.test(transactions[0]);
    bloomFilterEmitterCollection.test(transactions[1]);
    bloomFilterEmitterCollection.test(transactions[2]);

    bloomFilterEmitterCollection.emit('block', blocks[0]);

    mediator.emit(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT);
    mediator.emit(ProcessMediator.EVENTS.CLIENT_DISCONNECTED);

    expect(receivedTransactions).to.deep.equal([
      transactions[0],
      transactions[1],
    ]);

    const expectedMerkleBlock = MerkleBlock.build(
      blocks[0].header,
      [
        Buffer.from(transactions[0].hash, 'hex'),
        Buffer.from(transactions[1].hash, 'hex'),
        Buffer.from(transactions[2].hash, 'hex'),
      ],
      [true, true, false],
    );

    expectedMerkleBlock.hashes = expectedMerkleBlock.hashes
      .map(hash => reverseHash(hash));

    expect(receivedBlocks).to.have.a.lengthOf(1);
    expect(receivedBlocks[0]).to.deep.equal(expectedMerkleBlock);
  });

  it('should scan block for matching transactions if it is the first one arrived', () => {
    const receivedTransactions = [];
    const receivedBlocks = [];

    mediator.on(ProcessMediator.EVENTS.TRANSACTION, (tx) => {
      receivedTransactions.push(tx);
    });

    mediator.on(ProcessMediator.EVENTS.MERKLE_BLOCK, (merkleBlock) => {
      receivedBlocks.push(merkleBlock);
    });

    subscribeToNewTransactions(
      mediator,
      bloomFilter,
      testTransactionsAgainstFilter,
      bloomFilterEmitterCollection,
    );

    bloomFilterEmitterCollection.test(transactions[2]);

    bloomFilterEmitterCollection.emit('block', blocks[0]);

    mediator.emit(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT);
    mediator.emit(ProcessMediator.EVENTS.CLIENT_DISCONNECTED);

    expect(receivedTransactions).to.deep.equal([
      transactions[0],
      transactions[1],
    ]);

    const expectedMerkleBlock = MerkleBlock.build(
      blocks[0].header,
      [
        Buffer.from(transactions[0].hash, 'hex'),
        Buffer.from(transactions[1].hash, 'hex'),
        Buffer.from(transactions[2].hash, 'hex'),
      ],
      [true, true, false],
    );

    expectedMerkleBlock.hashes = expectedMerkleBlock.hashes
      .map(hash => reverseHash(hash));

    expect(receivedBlocks).to.have.a.lengthOf(1);
    expect(receivedBlocks[0]).to.deep.equal(expectedMerkleBlock);
  });

  it('should remove historical data from cache and send only data that is left', () => {
    const receivedTransactions = [];
    const receivedBlocks = [];

    mediator.on(ProcessMediator.EVENTS.TRANSACTION, (tx) => {
      receivedTransactions.push(tx);
    });

    mediator.on(ProcessMediator.EVENTS.MERKLE_BLOCK, (merkleBlock) => {
      receivedBlocks.push(merkleBlock);
    });

    subscribeToNewTransactions(
      mediator,
      bloomFilter,
      testTransactionsAgainstFilter,
      bloomFilterEmitterCollection,
    );

    bloomFilterEmitterCollection.test(transactions[0]);
    bloomFilterEmitterCollection.test(transactions[1]);
    bloomFilterEmitterCollection.test(transactions[2]);

    bloomFilterEmitterCollection.emit('block', blocks[0]);

    bloomFilterEmitterCollection.test(transactions[3]);
    bloomFilterEmitterCollection.test(transactions[4]);

    bloomFilterEmitterCollection.emit('block', blocks[1]);

    mediator.emit(ProcessMediator.EVENTS.HISTORICAL_BLOCK_SENT, blocks[0].hash);

    mediator.emit(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT);
    mediator.emit(ProcessMediator.EVENTS.CLIENT_DISCONNECTED);

    expect(receivedTransactions).to.deep.equal([
      transactions[3],
    ]);

    const expectedMerkleBlock = MerkleBlock.build(
      blocks[1].header,
      [
        Buffer.from(transactions[3].hash, 'hex'),
        Buffer.from(transactions[4].hash, 'hex'),
      ],
      [true, false],
    );

    expectedMerkleBlock.hashes = expectedMerkleBlock.hashes
      .map(hash => reverseHash(hash));

    expect(receivedBlocks).to.have.a.lengthOf(1);
    expect(receivedBlocks[0]).to.deep.equal(expectedMerkleBlock);
  });

  it('should do something with instant locks', () => {
    const receivedTransactions = [];
    const receivedBlocks = [];
    const receivedInstantLocks = [];

    mediator.on(ProcessMediator.EVENTS.TRANSACTION, (tx) => {
      receivedTransactions.push(tx);
    });

    mediator.on(ProcessMediator.EVENTS.MERKLE_BLOCK, (merkleBlock) => {
      receivedBlocks.push(merkleBlock);
    });

    mediator.on(ProcessMediator.EVENTS.INSTANT_LOCK, (instantLock) => {
      receivedInstantLocks.push(instantLock);
    })

    subscribeToNewTransactions(
      mediator,
      bloomFilter,
      testTransactionsAgainstFilter,
      bloomFilterEmitterCollection,
    );

    bloomFilterEmitterCollection.test(transactions[0]);
    bloomFilterEmitterCollection.test(transactions[1]);
    bloomFilterEmitterCollection.test(transactions[2]);

    bloomFilterEmitterCollection.emit('instantLock', )

    bloomFilterEmitterCollection.emit('block', blocks[0]);

    bloomFilterEmitterCollection.test(transactions[3]);
    bloomFilterEmitterCollection.test(transactions[4]);

    bloomFilterEmitterCollection.emit('block', blocks[1]);

    mediator.emit(ProcessMediator.EVENTS.HISTORICAL_BLOCK_SENT, blocks[0].hash);

    mediator.emit(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT);
    mediator.emit(ProcessMediator.EVENTS.CLIENT_DISCONNECTED);

    expect(receivedTransactions).to.deep.equal([
      transactions[3],
    ]);

    const expectedMerkleBlock = MerkleBlock.build(
      blocks[1].header,
      [
        Buffer.from(transactions[3].hash, 'hex'),
        Buffer.from(transactions[4].hash, 'hex'),
      ],
      [true, false],
    );

    expectedMerkleBlock.hashes = expectedMerkleBlock.hashes
      .map(hash => reverseHash(hash));

    expect(receivedBlocks).to.have.a.lengthOf(1);
    expect(receivedBlocks[0]).to.deep.equal(expectedMerkleBlock);


    expect.fail("Not implemented");
  });
});
