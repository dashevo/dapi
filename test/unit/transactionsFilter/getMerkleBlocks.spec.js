const chai = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const { MerkleBlock } = require('@dashevo/dashcore-lib');

const getMerkleBlocksFactory = require('../../../lib/transactionsFilter/getMerkleBlocksFactory');

const { expect } = chai;
chai.use(dirtyChai);
chai.use(chaiAsPromised);

const merkleBlockHex = '03000000' // Version
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
  async getMerkleBlocks() { return [merkleBlockHex]; },
};

describe('getMerkleBlocks', () => {
  beforeEach(() => {
    sinon.spy(coreRpcMock, 'getMerkleBlocks');
  });

  afterEach(() => {
    coreRpcMock.getMerkleBlocks.restore();
  });

  it('Should return an array of merkle blocks', async () => {
    const getMerkleBlocks = getMerkleBlocksFactory(coreRpcMock);
    const bloomFilter = '0fa00001';
    const fromBlockHash = '45afbfe270014d5593cb065562f1fed726f767fe334d8b3f4379025cfa5be8c5';
    const count = 1234;

    const merkleBlocks = await getMerkleBlocks(bloomFilter, fromBlockHash, count);

    expect(coreRpcMock.getMerkleBlocks.calledOnce).to.be.true();
    expect(coreRpcMock.getMerkleBlocks.calledWith(bloomFilter, fromBlockHash, count)).to.be.true();

    expect(merkleBlocks.length).to.be.equal(1);

    const merkleBlock = merkleBlocks[0];

    expect(merkleBlock).to.be.an.instanceof(MerkleBlock);
    expect(merkleBlock.getMatchedTransactionHashes().length).to.be.equal(4);
  });
});
