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
const emitInstantLockToFilterCollectionFactory = require('../../../lib/transactionsFilter/emitInstantLockToFilterCollectionFactory');

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
  let instantLockZmqMessagesMocks;
  let emitInstantLockToFilterCollection;

  let rawTsLockSigMessage = Buffer.from('02000000043d8e21a4cb4450437a8d8cba9c47c9c0c86779529ff380adb15f04ea5430a101000000006b48304502210084ac71029cdb9ee7350a619e5d161652e37966569dfdf4cabfc547befc86ffb60220178161a805c2ead81806946dea37663ce8e6574762ede7dc639e1fb5cf15d1ef01210202be5b073e61df41af9dc6119722c91a425f074b631036584e22dee0f324088cfeffffff340da676133869c0dfe304aedef72a5ae5d5523cccfc041faf6f89a2f7e8711c000000006b483045022100e7ae6359dc84dfae023de514a481c111c841c6de3c5868bdc36cc0546bb31ba10220044913ffb75681dddc9b111599cf9c8a04b9287c377c0c80ff5ab370584adc16012102ac12a8e35c4639f57fe1716298aaac12792db168e6068d6b1817363565b6b6f2feffffff32238ff0630231a01a917227a7e87b487b89b05a2a16b8e847aec1f89da46f55000000006a473044022022c5b76503c11e3d66bc88e80d97260766943fd3cf5e8d8fd703d4a2af538c62022070f8d0aa9d90d66de800eac18419fe8b51d82703d71fa0f9f1c5b1b2976fb13f012102312718f15e2ad5500a5198347011260518ae04c2cf2c2c54aae9edde8a4db962feffffff23985fd3e3c973ca0a7ef174676badf7adebbff14b8802bad799c792079581e0000000006b4830450221008cea305e64c9cc389d058219262c2feb924becea880fe16cc6d4076df73fe25702200dc27feac425fa20dd98b012337f61d6059b3f764a6555196bed0dd259c5c2ee012103ddcf5e9ca3e9778a69ce5c1e171f27a42dc5aba48fe21a0d378610939965a14dfeffffff02c7400f00000000001976a9146b85d8c17fff19a323c0bb3d697d934c6603094688ac926e8504000000001976a914c3d7e626e2f46c5c23085b6dc76a8b4a7003d95188ac00000000043d8e21a4cb4450437a8d8cba9c47c9c0c86779529ff380adb15f04ea5430a10100000000340da676133869c0dfe304aedef72a5ae5d5523cccfc041faf6f89a2f7e8711c0000000032238ff0630231a01a917227a7e87b487b89b05a2a16b8e847aec1f89da46f550000000023985fd3e3c973ca0a7ef174676badf7adebbff14b8802bad799c792079581e000000000c18ed89454bb43941bb572f3f86555293075bb1bc9418387d668d84294710fd29424783bbea720cb71e5356b57d90442dba6fed751bb407c09442d0090bcf7e96a993eb3810337104cca7f1ebc6ad39a106a9d7d08803675ccd2b5091f00eb40d73dbff98a573150d5d9a6af9060181b4b653ba3beb10b7b4d6645db696e6bbd', 'hex');

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
      txid: transactions[4].hash,
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80',
    });
    const instantLockTwo = InstantLock.fromObject({
      inputs: [
        {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 0,
        },
      ],
      txid: transactions[3].hash,
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80',
    });
    const instantLockThree = InstantLock.fromObject({
      inputs: [
        {
          outpointHash: '6e200d059fb567ba19e92f5c2dcd3dde522fd4e0a50af223752db16158dabb1d',
          outpointIndex: 0,
        },
      ],
      txid: transactions[0].hash,
      signature: '8967c46529a967b3822e1ba8a173066296d02593f0f59b3a78a30a7eef9c8a120847729e62e4a32954339286b79fe7590221331cd28d576887a263f45b595d499272f656c3f5176987c976239cac16f972d796ad82931d532102a4f95eec7d80',
    });

    instantLocks = [];
    instantLocks.push(instantLockOne);
    instantLocks.push(instantLockTwo);
    instantLocks.push(instantLockThree);

    instantLockZmqMessagesMocks = [
      Buffer.concat([transactions[4].toBuffer(), instantLockOne.toBuffer()]),
      Buffer.concat([transactions[3].toBuffer(), instantLockTwo.toBuffer()]),
      Buffer.concat([transactions[0].toBuffer(), instantLockThree.toBuffer()]),
    ];

    bloomFilter = BloomFilter.create(1, 0.0001);
    bloomFilter.insert(address.hashBuffer);

    bloomFilterEmitterCollection = new BloomFilterEmitterCollection();
    mediator = new ProcessMediator();

    emitInstantLockToFilterCollection = emitInstantLockToFilterCollectionFactory(
      bloomFilterEmitterCollection
    );
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

  it('should send instant locks for new transactions', () => {
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

    bloomFilterEmitterCollection.emit('block', blocks[0]);

    bloomFilterEmitterCollection.test(transactions[3]);
    bloomFilterEmitterCollection.test(transactions[4]);

    emitInstantLockToFilterCollection(instantLockZmqMessagesMocks[0]);
    emitInstantLockToFilterCollection(instantLockZmqMessagesMocks[1]);
    emitInstantLockToFilterCollection(instantLockZmqMessagesMocks[2]);

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

    // Deep copy instant lock
    const expectedInstantLock = InstantLock.fromBuffer(instantLocks[1].toBuffer());

    expect(receivedInstantLocks).to.have.length(2);
    expect(receivedInstantLocks[0]).to.be.deep.equal(expectedInstantLock);
    expect(receivedInstantLocks[0].txid).to.be.equal(receivedTransactions[0].hash);

    // The second transaction is the transaction that was added to the cache during historical sync,
    // which isn't covered by this test, but we still expect to receive an instant lock here,
    // since it waits for some time in the cache before being completely removed.
    const expectedInstantLockTwo = InstantLock.fromBuffer(instantLocks[2].toBuffer());

    expect(receivedInstantLocks[1]).to.be.deep.equal(expectedInstantLockTwo);
    expect(receivedInstantLocks[1].txid).to.be.equal(transactions[0].hash);
  });

  it('should remove transaction from instant lock waiting list if it sits in the cache for too long', () => {
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

    // emit 10 'block' events to get transaction 0 to be removed from the instant lock cache
    for (let i=0; i<=10; i++) {
      bloomFilterEmitterCollection.emit('block', blocks[0]);
    }

    bloomFilterEmitterCollection.test(transactions[3]);
    bloomFilterEmitterCollection.test(transactions[4]);

    emitInstantLockToFilterCollection(instantLockZmqMessagesMocks[0]);
    emitInstantLockToFilterCollection(instantLockZmqMessagesMocks[1]);
    emitInstantLockToFilterCollection(instantLockZmqMessagesMocks[2]);

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

    expect(receivedBlocks).to.have.a.lengthOf(10);

    // Unlike in the test above, because we've emitted some blocks, the second
    // instant lock should be removed from the cache
    const expectedInstantLock = InstantLock.fromBuffer(instantLocks[1].toBuffer());

    expect(receivedInstantLocks).to.have.length(1);
    expect(receivedInstantLocks[0]).to.be.deep.equal(expectedInstantLock);
    expect(receivedInstantLocks[0].txid).to.be.equal(receivedTransactions[0].hash);
  });
});
