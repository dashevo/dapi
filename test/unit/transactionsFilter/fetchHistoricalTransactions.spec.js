const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const { MerkleBlock } = require('@dashevo/dashcore-lib');

const fetchHistoricalTransactionsFactory = require('../../../lib/transactionsFilter/fetchHistoricalTransactionsFactory');

const { expect } = chai;
chai.use(dirtyChai);
chai.use(chaiAsPromised);

const rawMerkleBlock = '03000000' // Version
  + '35ce79ae46a65f0d0115d831584d0a6882117f75a65386f8f14e150000000000' // prevHash
  + 'a0055d45ad9b35e77fb01c59a4feb9976921493d2557a5ac0798b49e82ea1e99' // MerkleRoot
  + '6a04a055' // Time
  + 'c380181b' // Bits
  + '00270c9b' // Nonce
  + '0c000000' // Transaction Count
  + '08' // Hash Count
  + '9d0a368bc9923c6cb966135a4ceda30cc5f259f72c8843ce015056375f8a06ec' // Hash1
  + '39e5cd533567ac0a8602bcc4c29e2f01a4abb0fe68ffbc7be6c393db188b72e0' // Hash2
  + 'cd75b421157eca03eff664bdc165730f91ef2fa52df19ff415ab5acb30045425' // Hash3
  + '2ef9795147caaeecee5bc2520704bb372cde06dbd2e871750f31336fd3f02be3' // Hash4
  + '2241d3448560f8b1d3a07ea5c31e79eb595632984a20f50944809a61fdd9fe0b' // Hash5
  + '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5' // Hash6
  + '198c03da0ccf871db91fe436e2795908eac5cc7d164232182e9445f7f9db1ab2' // Hash7
  + 'ed07c181ce5ba7cb66d205bc970f43e1ca11996d611aa8e91e305eb8608c543c' // Hash8
  + '02' // Num Flag Bytes
  + 'db3f';

const coreRpcMock = {
  async getMerkleBlocks() { },
  async getRawTransaction() { return ''; },
  async getBlock() { return {}; },
  async getBlockHash() { return ''; },
};

const mockData = {
  blocks: [{
    hash: '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5',
    height: 2002,
  },
  {
    hash: '000000000000000000000000000000000000000000000000000000000000001c',
    height: 2582,
  },
  {
    hash: 'ed07c181ce5ba7cb66d205bc970f43e1ca11996d611aa8e91e305eb8608c543c',
    height: 4002,
  },
  {
    hash: '9d0a368bc9923c6cb966135a4ceda30cc5f259f72c8843ce015056375f8a06ec',
    height: 6002,
  },
  {
    hash: '198c03da0ccf871db91fe436e2795908eac5cc7d164232182e9445f7f9db1ab2',
    height: 6125,
  },
  // {
  //   hash: 'ed07c181ce5ba7cb66d205bc970f43e1ca11996d611aa8e91e305eb8608c543c',
  //   height: 8125,
  // }
  ],
  transactions: [],
};

describe('fetchHistoricalTransactions', () => {
  beforeEach(() => {
    sinon.stub(coreRpcMock, 'getMerkleBlocks')
      .withArgs()
      .resolves([rawMerkleBlock]);

    sinon.stub(coreRpcMock, 'getRawTransaction')
      .withArgs('cd75b421157eca03eff664bdc165730f91ef2fa52df19ff415ab5acb30045425')
      .resolves('cd75b421157eca03eff664bdc165730f91ef2fa52df19ff415ab5acb30045425')
      .withArgs('2ef9795147caaeecee5bc2520704bb372cde06dbd2e871750f31336fd3f02be3')
      .resolves('2ef9795147caaeecee5bc2520704bb372cde06dbd2e871750f31336fd3f02be3')
      .withArgs('2241d3448560f8b1d3a07ea5c31e79eb595632984a20f50944809a61fdd9fe0b')
      .resolves('2241d3448560f8b1d3a07ea5c31e79eb595632984a20f50944809a61fdd9fe0b')
      .withArgs('45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5')
      .resolves('45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5');

    sinon.stub(coreRpcMock, 'getBlock');
    sinon.stub(coreRpcMock, 'getBlockHash');

    mockData.blocks.forEach((mockedBlockData) => {
      coreRpcMock.getBlock.withArgs(mockedBlockData.hash).resolves(mockedBlockData);
    });

    mockData.blocks.forEach((mockedBlockData) => {
      coreRpcMock.getBlockHash.withArgs(mockedBlockData.height).resolves(mockedBlockData.hash);
    });
  });

  afterEach(() => {
    coreRpcMock.getMerkleBlocks.restore();
    coreRpcMock.getRawTransaction.restore();
    coreRpcMock.getBlock.restore();
    coreRpcMock.getBlockHash.restore();
  });
  it('Count is lesser than max block headers', async () => {
    const fetchHistoricalTransactions = fetchHistoricalTransactionsFactory(coreRpcMock);
    const bloomFilter = '0fa00001';
    const fromBlockHash = '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5';
    const count = 580;

    const merkleBlocksAndTransactions = fetchHistoricalTransactions(
      {},
      bloomFilter,
      fromBlockHash,
      count,
    );

    const { value: { merkleBlock, rawTransactions } } = await merkleBlocksAndTransactions.next();

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlock.getCall(0).calledWith(mockData.blocks[0].hash)).to.be.true();

    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlockHash.getCall(0).calledWith(mockData.blocks[0].height)).to.be.true();

    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(1);
    expect(
      coreRpcMock.getMerkleBlocks.getCall(0).calledWith(
        bloomFilter, mockData.blocks[0].hash, 580,
      ),
    ).to.be.true();

    expect(merkleBlock).to.be.an.instanceof(MerkleBlock);
    expect(rawTransactions).to.be.an('array');
    rawTransactions.forEach((rawTx) => {
      expect(rawTx).to.be.a('string');
    });

    const { done } = await merkleBlocksAndTransactions.next();

    expect(done).to.be.true();
  });
  it('Count is bigger than max block headers', async () => {
    const fetchHistoricalTransactions = fetchHistoricalTransactionsFactory(coreRpcMock);
    const bloomFilter = '0fa00001';
    const fromBlockHash = '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5';
    const count = 4123;

    const merkleBlocksIterator = fetchHistoricalTransactions(
      {},
      bloomFilter,
      fromBlockHash,
      count,
    );

    const { value: { merkleBlock, rawTransactions } } = await merkleBlocksIterator.next();

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlock.getCall(0).calledWith(mockData.blocks[0].hash)).to.be.true();

    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlockHash.getCall(0).calledWith(mockData.blocks[0].height)).to.be.true();

    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(1);
    expect(
      coreRpcMock.getMerkleBlocks.getCall(0).calledWith(
        bloomFilter, mockData.blocks[0].hash, 2000,
      ),
    ).to.be.true();

    expect(merkleBlock).to.be.an.instanceof(MerkleBlock);
    expect(rawTransactions).to.be.an('array');
    rawTransactions.forEach((rawTx) => {
      expect(rawTx).to.be.a('string');
    });

    await merkleBlocksIterator.next();

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);

    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(2);
    expect(coreRpcMock.getBlockHash.getCall(1).calledWith(mockData.blocks[1].height)).to.be.true();

    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(2);
    expect(
      coreRpcMock.getMerkleBlocks.getCall(1).calledWith(
        bloomFilter, mockData.blocks[1].hash, 2000,
      ),
    ).to.be.true();

    await merkleBlocksIterator.next();

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);

    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(3);
    expect(coreRpcMock.getBlockHash.getCall(2).calledWith(mockData.blocks[2].height)).to.be.true();

    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(3);
    expect(
      coreRpcMock.getMerkleBlocks.getCall(2).calledWith(
        bloomFilter, mockData.blocks[2].hash, 123,
      ),
    ).to.be.true();

    const { done } = await merkleBlocksIterator.next();

    expect(done).to.be.true();
  });
  it('Should return one merkle block at a time, even if there is more than two blocks found in a range', async () => {
    coreRpcMock.getMerkleBlocks.restore();
    sinon.stub(coreRpcMock, 'getMerkleBlocks')
      .withArgs()
      .resolves([rawMerkleBlock, rawMerkleBlock]);

    const fetchHistoricalTransactions = fetchHistoricalTransactionsFactory(coreRpcMock);
    const bloomFilter = '0fa00001';
    const fromBlockHash = '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5';
    const count = 580;

    const merkleBlocksAndTransactions = fetchHistoricalTransactions(
      {},
      bloomFilter,
      fromBlockHash,
      count,
    );

    const { value: { merkleBlock, rawTransactions } } = await merkleBlocksAndTransactions.next();

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlock.getCall(0).calledWith(mockData.blocks[0].hash)).to.be.true();

    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlockHash.getCall(0).calledWith(mockData.blocks[0].height)).to.be.true();

    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(1);
    expect(
      coreRpcMock.getMerkleBlocks.getCall(0).calledWith(
        bloomFilter, mockData.blocks[0].hash, 580,
      ),
    ).to.be.true();

    expect(merkleBlock).to.be.an.instanceof(MerkleBlock);
    expect(rawTransactions).to.be.an('array');
    rawTransactions.forEach((rawTx) => {
      expect(rawTx).to.be.a('string');
    });

    const {
      value: {
        merkleBlock: secondMerkleBlock,
        rawTransactions: secondSetOfRawTransactions,
      },
    } = await merkleBlocksAndTransactions.next();

    expect(secondMerkleBlock).to.be.an.instanceof(MerkleBlock);
    expect(secondSetOfRawTransactions).to.be.an('array');
    secondSetOfRawTransactions.forEach((rawTx) => {
      expect(rawTx).to.be.a('string');
    });

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(1);
    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(1);

    const { done } = await merkleBlocksAndTransactions.next();

    expect(done).to.be.true();
  });
  it('Should skip interval with no merkle blocks', async () => {
    const bloomFilter = '0fa00001';
    coreRpcMock.withArgs(bloomFilter, mockData.blocks[1].hash, 2000).resolves([]);

    const fromBlockHash = '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5';
    const count = 4123;

    const fetchHistoricalTransactions = fetchHistoricalTransactionsFactory(coreRpcMock);

    const merkleBlocksIterator = fetchHistoricalTransactions(
      {},
      bloomFilter,
      fromBlockHash,
      count,
    );

    await merkleBlocksIterator.next();

    expect(coreRpcMock.getBlock.callCount).to.be.equal(1);
    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(1);
    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(1);

    await merkleBlocksIterator.next();

    // As there will be one interval (4002-6002) with no merkle blocks,
    // all call count should increase by 2
    expect(coreRpcMock.getBlock.callCount).to.be.equal(3);
    expect(coreRpcMock.getBlockHash.callCount).to.be.equal(3);
    expect(coreRpcMock.getMerkleBlocks.callCount).to.be.equal(3);
  });
});
