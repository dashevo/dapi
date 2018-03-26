const SpvService = require('../lib/services/spv');
const config = require('../lib/config');
const bitcore = require('bitcore-lib-dash');
const log = require('../lib/log');
const bloomFilter = require('bloom-filter');

const spvService = new SpvService(config.dashcore.p2p);

spvService.start()
  .then(() => {
    bitcore.Networks.defaultNetwork = bitcore.Networks.testnet;

    // TODO: doing a privateke.toPublicKey() causes this bug:
    // https://github.com/bitpay/bitcore-wallet-client/issues/392
    // likely bitcore-lib-dash did not fix this bug as discribed above ^^
    // out of scope for this task, new task to be created
    // const pkSeed = 'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79';
    // const privateKey = new bitcore.PrivateKey(pkSeed);
    // const publicKey = privateKey.toPublicKey();// yj62dAADEBbryoSMG6TcosmH9Gu2asXwat

    // using hard coded value until bug ^^ has been resolved
    // eslint-disable-next-line max-len
    const tempPubKeyBuffer = Buffer.from([3, 250, 214, 40, 72, 241, 166, 205, 228, 196, 217, 69, 61, 173, 234, 113, 76, 189, 89, 241, 40, 32, 135, 133, 61, 232, 176, 198, 7, 43, 236, 39, 231]);

    const filter = bloomFilter.create(100, 0.000001, 0, bloomFilter.BLOOM_UPDATE_ALL);

    // filter.insert(bitcore.crypto.Hash.sha256ripemd160(publicKey.toBuffer()));
    filter.insert(bitcore.crypto.Hash.sha256ripemd160(tempPubKeyBuffer));
    spvService.loadBloomFilter(filter);

    // log.info(`...filtering for transactions & block on + ${publicKey.toAddress()}`);
    log.info('...filtering for transactions & block on yj62dAADEBbryoSMG6TcosmH9Gu2asXwat');

    // Check cache
    setInterval(() => {

    }, 5000);
  });

