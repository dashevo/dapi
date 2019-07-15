const { expect, use } = require('chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const {
  startDapi,
} = require('@dashevo/dp-services-ctl');

const {
  Address,
  PrivateKey,
  Transaction,
  Networks,
  BloomFilter,
  MerkleBlock,
} = require('@dashevo/dashcore-lib');

const wait = require('../../../../../lib/utils/wait');

use(chaiAsPromised);
use(dirtyChai);

describe('subscribeToTransactionsWithProofsHandlerFactory', function main() {
  this.timeout(160000);

  let coreAPI;
  let dapiClient;
  let removeDapi;

  let addressString;
  let address;
  let privateKey;

  let historicalTransactions;

  let bloomFilter;
  let fromBlockHash;

  let merkleBlockStrings;

  beforeEach(async () => {
    historicalTransactions = [];

    bloomFilter = BloomFilter.create(1, 0.001);

    const {
      dashCore,
      dapiTxFilterStream,
      remove,
    } = await startDapi({
      dapi: {
        cacheNodeModules: true,
        localAppPath: process.cwd(),
        container: {
          volumes: [
            `${process.cwd()}/lib:/usr/src/app/lib`,
            `${process.cwd()}/scripts:/usr/src/app/scripts`,
          ],
        },
      },
    });

    removeDapi = remove;

    coreAPI = dashCore.getApi();
    dapiClient = dapiTxFilterStream.getApi();

    ({ result: addressString } = await coreAPI.getNewAddress());
    const { result: privateKeyString } = await coreAPI.dumpPrivKey(addressString);

    address = Address.fromString(addressString, Networks.testnet);
    privateKey = new PrivateKey(privateKeyString);

    bloomFilter.insert(address.hashBuffer);

    await coreAPI.generate(500);
    await coreAPI.sendToAddress(addressString, 10);
    await coreAPI.generate(10);

    ({ result: fromBlockHash } = await coreAPI.getBestBlockHash());

    const filterUnspentInputs = input => input.address === addressString;
    for (let i = 0; i < 10; i++) {
      const { result: unspent } = await coreAPI.listUnspent();
      const inputs = unspent.filter(input => filterUnspentInputs(input));

      const transaction = new Transaction()
        .from(inputs)
        .to(address, 10000)
        .change(address)
        .sign(privateKey);

      historicalTransactions.push(transaction);

      await coreAPI.sendRawTransaction(transaction.serialize());
      await coreAPI.generate(1);
    }

    ({ result: merkleBlockStrings } = await coreAPI.getMerkleBlocks(
      bloomFilter.toBuffer().toString('hex'),
      fromBlockHash,
    ));
  });

  afterEach(async () => {
    await removeDapi();
  });

  it('should respond with only historical data', async () => {
    const receivedTransactions = [];
    const receivedMerkleBlocks = [];

    const bloomFilterObject = bloomFilter.toObject();

    const stream = await dapiClient.subscribeToTransactionsWithProofs(
      {
        vData: new Uint8Array(bloomFilterObject.vData),
        nHashFuncs: bloomFilterObject.nHashFuncs,
        nTweak: bloomFilterObject.nTweak,
        nFlags: bloomFilterObject.nFlags,
      },
      {
        fromBlockHash: Buffer.from(fromBlockHash, 'hex'),
        count: 11,
      },
    );

    stream.on('data', (response) => {
      const merkleBlock = response.getRawMerkleBlock();
      const transactions = response.getRawTransactions();

      if (merkleBlock) {
        receivedMerkleBlocks.push(
          Buffer.from(merkleBlock).toString('hex'),
        );
      }

      if (transactions) {
        transactions.getTransactionsList()
          .forEach((tx) => {
            receivedTransactions.push(
              new Transaction(Buffer.from(tx)),
            );
          });
      }
    });

    let streamEnded = false;
    stream.on('end', () => {
      streamEnded = true;
    });

    let streamError;
    stream.on('error', (e) => {
      streamError = e;
    });

    while (!streamEnded) {
      if (streamError) {
        throw streamError;
      }
      await wait(1000);
    }

    expect(streamEnded).to.be.true();

    const receivedTransactionsHashes = receivedTransactions
      .map(tx => tx.hash);

    const historicalTransactionsHashes = historicalTransactions
      .map(tx => tx.hash);

    historicalTransactionsHashes.forEach((txHash) => {
      expect(receivedTransactionsHashes).to.include(txHash);
    });

    expect(receivedMerkleBlocks).to.deep.equal(merkleBlockStrings);
  });

  it('should respond with both historical and new data', async () => {
    const receivedTransactions = [];
    const receivedMerkleBlocks = [];

    const bloomFilterObject = bloomFilter.toObject();

    const stream = await dapiClient.subscribeToTransactionsWithProofs(
      {
        vData: new Uint8Array(bloomFilterObject.vData),
        nHashFuncs: bloomFilterObject.nHashFuncs,
        nTweak: bloomFilterObject.nTweak,
        nFlags: bloomFilterObject.nFlags,
      },
      {
        fromBlockHash: Buffer.from(fromBlockHash, 'hex'),
      },
    );

    stream.on('data', (response) => {
      const merkleBlock = response.getRawMerkleBlock();
      const transactions = response.getRawTransactions();

      if (merkleBlock) {
        receivedMerkleBlocks.push(
          Buffer.from(merkleBlock).toString('hex'),
        );
      }

      if (transactions) {
        transactions.getTransactionsList()
          .forEach((tx) => {
            receivedTransactions.push(
              new Transaction(Buffer.from(tx)),
            );
          });
      }
    });

    let streamEnded = false;
    stream.on('end', () => {
      streamEnded = true;
    });

    let streamError;
    stream.on('error', (e) => {
      streamError = e;
    });

    await wait(20000);

    if (streamEnded) {
      throw new Error('Stream has ended');
    }

    if (streamError) {
      throw streamError;
    }

    const { result: unspent } = await coreAPI.listUnspent();
    const inputs = unspent.filter(input => input.address === addressString);

    const transaction = new Transaction()
      .from(inputs)
      .to(address, 10000)
      .change(address)
      .sign(privateKey);

    historicalTransactions.push(transaction);

    await coreAPI.sendRawTransaction(transaction.serialize());
    await coreAPI.generate(1);

    await wait(20000);

    ({ result: merkleBlockStrings } = await coreAPI.getMerkleBlocks(
      bloomFilter.toBuffer().toString('hex'),
      fromBlockHash,
    ));

    const receivedTransactionsHashes = receivedTransactions
      .map(tx => tx.hash);

    const historicalTransactionsHashes = historicalTransactions
      .map(tx => tx.hash);

    historicalTransactionsHashes.forEach((txHash) => {
      expect(receivedTransactionsHashes).to.include(txHash);
    });

    const rcvMB = receivedMerkleBlocks
      .map(s => Buffer.from(s, 'hex'))
      .map(b => new MerkleBlock(b))
      .map(b => b.toObject());

    const hstMB = merkleBlockStrings
      .map(s => Buffer.from(s, 'hex'))
      .map(b => new MerkleBlock(b))
      .map(b => b.toObject());

    expect(rcvMB).to.deep.equal(hstMB);
  });

  it('should respond with a proper data in case of reorganization', async () => {
    const receivedTransactions = [];
    const receivedMerkleBlocks = [];

    const bloomFilterObject = bloomFilter.toObject();

    const stream = await dapiClient.subscribeToTransactionsWithProofs(
      {
        vData: new Uint8Array(bloomFilterObject.vData),
        nHashFuncs: bloomFilterObject.nHashFuncs,
        nTweak: bloomFilterObject.nTweak,
        nFlags: bloomFilterObject.nFlags,
      },
      {
        fromBlockHash: Buffer.from(fromBlockHash, 'hex'),
      },
    );

    stream.on('data', (response) => {
      const merkleBlock = response.getRawMerkleBlock();
      const transactions = response.getRawTransactions();

      if (merkleBlock) {
        receivedMerkleBlocks.push(
          Buffer.from(merkleBlock).toString('hex'),
        );
      }

      if (transactions) {
        transactions.getTransactionsList()
          .forEach((tx) => {
            receivedTransactions.push(
              new Transaction(Buffer.from(tx)),
            );
          });
      }
    });

    let streamEnded = false;
    stream.on('end', () => {
      streamEnded = true;
    });

    let streamError;
    stream.on('error', (e) => {
      streamError = e;
    });

    await wait(20000);

    if (streamEnded) {
      throw new Error('Stream has ended');
    }

    if (streamError) {
      throw streamError;
    }

    const { result: unspent } = await coreAPI.listUnspent();
    const inputs = unspent.filter(input => input.address === addressString);

    const transaction = new Transaction()
      .from(inputs)
      .to(address, 10000)
      .change(address)
      .sign(privateKey);

    historicalTransactions.push(transaction);

    await coreAPI.sendRawTransaction(transaction.serialize());
    await coreAPI.generate(1);

    await wait(20000);

    ({ result: merkleBlockStrings } = await coreAPI.getMerkleBlocks(
      bloomFilter.toBuffer().toString('hex'),
      fromBlockHash,
    ));

    const receivedTransactionsHashes = receivedTransactions
      .map(tx => tx.hash);

    const historicalTransactionsHashes = historicalTransactions
      .map(tx => tx.hash);

    historicalTransactionsHashes.forEach((txHash) => {
      expect(receivedTransactionsHashes).to.include(txHash);
    });

    const rcvMB = receivedMerkleBlocks
      .map(s => Buffer.from(s, 'hex'))
      .map(b => new MerkleBlock(b))
      .map(b => b.toObject());

    const hstMB = merkleBlockStrings
      .map(s => Buffer.from(s, 'hex'))
      .map(b => new MerkleBlock(b))
      .map(b => b.toObject());

    expect(rcvMB).to.deep.equal(hstMB);

    const receivedTransactionsSize = receivedTransactions.length;

    const { result: hashToInvalidate } = await coreAPI.getBestBlockHash();
    await coreAPI.invalidateBlock(hashToInvalidate);
    await coreAPI.generate(1);

    await wait(20000);

    const receivedTransactionsSizeAfterReorg = receivedTransactions.length;

    expect(receivedTransactionsSize).to.equal(receivedTransactionsSizeAfterReorg);

    // TODO: check that we've received last merkle block and it is correct one
  });
});
