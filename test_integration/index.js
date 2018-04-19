const SpvService = require('../lib/services/spv');
const bitcore = require('bitcore-lib-dash');

bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

const log = require('../lib/log');
const bloomFilter = require('bloom-filter');

const listenToBloomFilter = (privKey) => {
  const nbElements = 100;
  const falsePositiveRate = 0.000001;

  const filter = bloomFilter.create(nbElements, falsePositiveRate, 0, bloomFilter.BLOOM_UPDATE_ALL);
  const publicKey = privKey.toPublicKey();
  filter.insert(bitcore.crypto.Hash.sha256ripemd160(publicKey.toBuffer()));

  SpvService
    .loadBloomFilter(filter)
    .then(() => {
      log.info('...filtering for transactions & block on', publicKey.toAddress().toString('hex'));

      // Check cache
      let lastTxLength = 0;
      let lastMerkleLength = 0;

      // Todo: re-investigate after discrepancy of all and not
      // only filterblocks returned has been fixed
      // spvService
      //   .getBlocks('0000000000747fd6af8c8aa61da1c2ec1f089fafc824bae9c3bf7ef51f20a777');

      setInterval(() => {
        const clientCache = SpvService.getData(filter);
        if (clientCache && clientCache.merkleblocks.length > lastMerkleLength) {
          log.info(`MOCK CLIENT ${publicKey.toAddress().toString('hex')}: ${clientCache.merkleblocks.length - lastMerkleLength} new merkle block(s) found`);
          lastMerkleLength = clientCache.merkleblocks.length;
        }

        if (clientCache && clientCache.transactions.length > lastTxLength) {
          log.info(`MOCK CLIENT ${publicKey.toAddress().toString('hex')}: ${clientCache.transactions.length - lastTxLength} new transaction(s) found`);
          lastTxLength = clientCache.transactions.length;
        }
      }, 10000);
    });
};

['b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79',
  'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb78']
  .forEach(seed => listenToBloomFilter(new bitcore.PrivateKey(seed)));

