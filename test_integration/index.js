// This test simulates client actions to be implemented on SDK
// To test send tDash to yj62dAADEBbryoSMG6TcosmH9Gu2asXwat (normal NOT instant Send)
const SpvService = require('../lib/services/spv');
const config = require('../lib/config');
const bitcore = require('bitcore-lib-dash');

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

const log = require('../lib/log');
const bloomFilter = require('bloom-filter');

const spvService = new SpvService(config.dashcore.p2p);

const listenToBloomFilter = (privKey) => {
  const nbElements = 100;
  const falsePositiveRate = 0.000001;


  const filter = bloomFilter.create(nbElements, falsePositiveRate, 0, bloomFilter.BLOOM_UPDATE_ALL);
  const publicKey = privKey.toPublicKey();// yN5XwBX1KUXyzNhhrTb2uJoZXLm2m6dwRi
  filter.insert(bitcore.crypto.Hash.sha256ripemd160(publicKey.toBuffer()));

  spvService
    .loadBloomFilter(filter)
    .then(() => {
      // log.info(`...filtering for transactions & merkle blocks on + ${publicKey.toAddress()}`);
      log.info('...filtering for transactions & block on', publicKey.toAddress());

      // Check cache
      let lastTxLength = 0;
      let lastMerkleLength = 0;

      // Todo: re-investigate after discrepancy of all and not
      // only filterblocks returned has been fixed
      // spvService
      //   .getBlocks('0000000000747fd6af8c8aa61da1c2ec1f089fafc824bae9c3bf7ef51f20a777');

      setInterval(() => {
        const clientCache = spvService.getData(filter);
        if (clientCache && clientCache.merkleblocks.length > lastMerkleLength) {
          log.info(`CLIENT: ${clientCache.merkleblocks.length - lastMerkleLength} new merkle block(s) found`);
          lastMerkleLength = clientCache.merkleblocks.length;
        }

        if (clientCache && clientCache.transactions.length > lastTxLength) {
          log.info(`CLIENT: ${clientCache.transactions.length - lastTxLength} new transaction(s) found`);
          lastTxLength = clientCache.transactions.length;
        }
      }, 10000);
    });
};


// TODO: doing a privateke.toPublicKey() causes this bug:
// https://github.com/bitpay/bitcore-wallet-client/issues/392
// likely bitcore-lib-dash did not fix this bug as discribed above ^^
// out of scope for this task, new task to be created
const pkSeed = 'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79';
const privateKey = new bitcore.PrivateKey(pkSeed);
// const publicKey = privateKey.toPublicKey();// yj62dAADEBbryoSMG6TcosmH9Gu2asXwat

// using hard coded value until bug ^^ has been resolved
// eslint-disable-next-line max-len
// const tempPubKeyBuffer = Buffer.from([3, 250, 214, 40, 72, 241, 166, 205, 228, 196, 217, 69, 61, 173, 234, 113, 76, 189, 89, 241, 40, 32, 135, 133, 61, 232, 176, 198, 7, 43, 236, 39, 231]);

const pkSeed2 = 'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb78';
const privateKey2 = new bitcore.PrivateKey(pkSeed2);

listenToBloomFilter(privateKey);
listenToBloomFilter(privateKey2);

