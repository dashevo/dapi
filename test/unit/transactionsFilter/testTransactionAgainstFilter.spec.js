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
    console.log(address.toString());
    console.log(address.toString().length);
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
});
