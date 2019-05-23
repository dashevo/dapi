const chai = require('chai');
const dirtyChai = require('dirty-chai');
const BloomFilter = require('bloom-filter');
const { Transaction, PrivateKey, Script } = require('@dashevo/dashcore-lib');

const { Output, Input } = Transaction;
const { expect } = chai;
chai.use(dirtyChai);

const testTransactionAgainstFilter = require('../../../lib/transactionsFilter/testTransactionAgainstFilter');

describe('testTransactionAgainstFilter', () => {
  it('Should match on address in output', () => {
    const filter = BloomFilter.create(1, 0.001);
    const address = new PrivateKey().toAddress();
    const tx = new Transaction().to(address, 10);
    filter.insert(address.hashBuffer);

    const result = testTransactionAgainstFilter(filter, tx);
    expect(result).to.be.true();
  });
  it('Should not match on address if there is no such output in transaction', () => {
    const filter = BloomFilter.create(1, 0.001);
    const addressInFilter = new PrivateKey().toAddress();
    const addressInTransaction = new PrivateKey().toAddress();
    const tx = new Transaction().to(addressInTransaction, 10);
    filter.insert(addressInFilter.hashBuffer);

    const result = testTransactionAgainstFilter(filter, tx);
    expect(result).to.be.false();
  });
  it('Should match when input script contains desired data', () => {
    const filter = BloomFilter.create(1, 0.001);
    const address = new PrivateKey().toAddress();
    const tx = new Transaction().to(address, 10);
    filter.insert(address.hashBuffer);

    const vout = 0;
    const input = new Input({
      prevTxId: tx.id,
      output: tx.outputs[vout],
      outputIndex: vout,
      script: Script.buildPublicKeyHashOut(address),
    });

    const txWIthInput = new Transaction().addInput(input);

    const result = testTransactionAgainstFilter(filter, txWIthInput);
    expect(result).to.be.true();
  });
  it("Should not match when input script doesn't contain desired data", () => {
    const filter = BloomFilter.create(1, 0.001);
    const addressInFilter = new PrivateKey().toAddress();
    const addressInTransaction = new PrivateKey().toAddress();
    const tx = new Transaction().to(addressInTransaction, 10);
    filter.insert(addressInFilter.hashBuffer);

    const vout = 0;
    const input = new Input({
      prevTxId: tx.id,
      output: tx.outputs[vout],
      outputIndex: vout,
      script: Script.buildPublicKeyHashOut(addressInTransaction),
    });

    const txWIthInput = new Transaction().addInput(input);

    const result = testTransactionAgainstFilter(filter, txWIthInput);
    expect(result).to.be.false();
  });
  it('Should add outpoint to the filter if BLOOM_UPDATE_ALL flag is set in the filter'
    + ' and match transaction with that outpoint in input', () => {
    const filter = BloomFilter.create(1, 0.001);
    const address = new PrivateKey().toAddress();
    const tx = new Transaction().to(address, 10);
    filter.nFlags = BloomFilter.BLOOM_UPDATE_ALL;
    filter.insert(address.hashBuffer);

    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    const vout = 0;
    const txWIthInput = new Transaction().from({
      txid: tx.id,
      vout,
      script: tx.outputs[vout].script,
      satoshis: tx.outputs[vout].satoshis,
    });

    expect(testTransactionAgainstFilter(filter, txWIthInput)).to.be.true();
  });
  it('Should not add outpoint to the filter if BLOOM_UPDATE_NONE flag is'
    + ' set in the filter', () => {
    const filter = BloomFilter.create(1, 0.001);
    const address = new PrivateKey().toAddress();
    const tx = new Transaction().to(address, 10);
    filter.nFlags = BloomFilter.BLOOM_UPDATE_NONE;
    filter.insert(address.hashBuffer);

    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    const vout = 0;
    const txWIthInput = new Transaction().from({
      txid: tx.id,
      vout,
      script: tx.outputs[vout].script,
      satoshis: tx.outputs[vout].satoshis,
    });

    expect(testTransactionAgainstFilter(filter, txWIthInput)).to.be.false();
  });
  it('Should add outpoint to the filter if BLOOM_UPDATE_P2PUBKEY_ONLY,'
    + ' and output is pub key out', () => {
    const filter = BloomFilter.create(1, 0.001);
    const pubKey = new PrivateKey().toPublicKey();
    const output = new Output({
      satoshis: 10,
      script: Script.buildPublicKeyOut(pubKey),
    });
    const tx = new Transaction().addOutput(output);
    filter.nFlags = BloomFilter.BLOOM_UPDATE_P2PUBKEY_ONLY;
    filter.insert(pubKey.toBuffer());

    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    const vout = 0;
    const txWIthInput = new Transaction().from({
      txid: tx.id,
      vout,
      script: tx.outputs[vout].script,
      satoshis: tx.outputs[vout].satoshis,
    });

    expect(testTransactionAgainstFilter(filter, txWIthInput)).to.be.true();
  });
  it('Should not add outpoint to the filter if BLOOM_UPDATE_P2PUBKEY_ONLY,'
    + ' and output is to pub key hash', () => {
    const filter = BloomFilter.create(1, 0.001);
    const address = new PrivateKey().toAddress();
    const tx = new Transaction().to(address, 10);
    filter.nFlags = BloomFilter.BLOOM_UPDATE_P2PUBKEY_ONLY;
    filter.insert(address.hashBuffer);

    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    const vout = 0;
    const txWIthInput = new Transaction().from({
      txid: tx.id,
      vout,
      script: tx.outputs[vout].script,
      satoshis: tx.outputs[vout].satoshis,
    });

    expect(testTransactionAgainstFilter(filter, txWIthInput)).to.be.false();
  });
  it('Should add outpoint to the filter if BLOOM_UPDATE_P2PUBKEY_ONLY'
    + ' is set and matched output is multisig', () => {
    const filter = BloomFilter.create(3, 0.001);
    const pubKeys = [
      new PrivateKey().toPublicKey(),
      new PrivateKey().toPublicKey(),
      new PrivateKey().toPublicKey(),
    ];
    const output = new Output({
      satoshis: 10,
      script: Script.buildMultisigOut(pubKeys, 2),
    });
    const tx = new Transaction().addOutput(output);
    filter.nFlags = BloomFilter.BLOOM_UPDATE_P2PUBKEY_ONLY;
    pubKeys.forEach(pubKey => filter.insert(pubKey.toBuffer()));

    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    const vout = 0;
    const txWIthInput = new Transaction().from({
      txid: tx.id,
      vout,
      script: tx.outputs[vout].script,
      satoshis: tx.outputs[vout].satoshis,
    });

    expect(testTransactionAgainstFilter(filter, txWIthInput)).to.be.true();
  });
  it('Should not add outpoint to the filter if output is multisig and '
    + 'BLOOM_UPDATE_P2PUBKEY_ONLY flag is not set', () => {
    const filter = BloomFilter.create(3, 0.001);
    const pubKeys = [
      new PrivateKey().toPublicKey(),
      new PrivateKey().toPublicKey(),
      new PrivateKey().toPublicKey(),
    ];
    const output = new Output({
      satoshis: 10,
      script: Script.buildMultisigOut(pubKeys, 2),
    });
    const tx = new Transaction().addOutput(output);
    filter.nFlags = BloomFilter.BLOOM_UPDATE_NONE;
    pubKeys.forEach(pubKey => filter.insert(pubKey.toBuffer()));

    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    const vout = 0;
    const txWIthInput = new Transaction().from({
      txid: tx.id,
      vout,
      script: tx.outputs[vout].script,
      satoshis: tx.outputs[vout].satoshis,
    });

    expect(testTransactionAgainstFilter(filter, txWIthInput)).to.be.false();
  });

  it('Should pass the same test vector as dashcore implementation does', () => {
    const txHex = '01000000010b26e9b7735eb6aabdf358bab62f9816a21ba9ebdb719d5299e88607d722c190000000008b4830450220070aca44506c5cef3a16ed519d7c3c39f8aab192c4e1c90d065f37b8a4af6141022100a8e160b856c2d43d27d8fba71e5aef6405b8643ac4cb7cb3c462aced7f14711a0141046d11fee51b0e60666d5049a9101a72741df480b96ee26488a4d3466b95c9a40ac5eeef87e10a5cd336c19a84565f80fa6c547957b7700ff4dfbdefe76036c339ffffffff021bff3d11000000001976a91404943fdd508053c75000106d3bc6e2754dbcff1988ac2f15de00000000001976a914a266436d2965547608b9e15d9032a7b9d64fa43188ac00000000';
    const txHash = 'b4749f017444b051c44dfd2720e88f314ff94f3dd6d56d40ef65854fcd7fff6b';
    const inputSignature = '30450220070aca44506c5cef3a16ed519d7c3c39f8aab192c4e1c90d065f37b8a4af6141022100a8e160b856c2d43d27d8fba71e5aef6405b8643ac4cb7cb3c462aced7f14711a01';
    const inputPubKey = '046d11fee51b0e60666d5049a9101a72741df480b96ee26488a4d3466b95c9a40ac5eeef87e10a5cd336c19a84565f80fa6c547957b7700ff4dfbdefe76036c339';
    const outputAddress = '04943fdd508053c75000106d3bc6e2754dbcff19';
    const outputAddress2 = 'a266436d2965547608b9e15d9032a7b9d64fa431';
    const outputIndex = '90c122d70786e899529d71dbeba91ba216982fb6ba58f3bdaab65e73b7e9260b00000000';
    const randomHash = '00000009e784f32f62ef849763d4f45b98e07ba658647343b915ff832b110436';
    const randomAddress = '0000006d2965547608b9e15d9032a7b9d64fa431';
    const irrelevantOutputIndex = '90c122d70786e899529d71dbeba91ba216982fb6ba58f3bdaab65e73b7e9260b00000001';
    const irrelevantOutputIndex2 = '000000d70786e899529d71dbeba91ba216982fb6ba58f3bdaab65e73b7e9260b00000000';

    const tx = new Transaction(txHex);

    let filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(txHash, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(inputSignature, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(inputPubKey, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(outputAddress, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(outputAddress2, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(outputIndex, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.true();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(randomHash, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.false();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(randomAddress, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.false();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(irrelevantOutputIndex, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.false();

    filter = BloomFilter.create(1, 0.0001, 0, BloomFilter.BLOOM_UPDATE_ALL);
    filter.insert(Buffer.from(irrelevantOutputIndex2, 'hex'));
    expect(testTransactionAgainstFilter(filter, tx)).to.be.false();
  });

  // TODO: test coinbase tx;
  // TODO: test outpoint serialization
});
