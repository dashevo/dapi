const {
  startDapi,
} = require('@dashevo/dp-services-ctl');

const {
  PrivateKey,
  PublicKey,
  Transaction,
} = require('@dashevo/dashcore-lib');

const DashPlatformProtocol = require('@dashevo/dpp');

const wait = require('../../../../../lib/utils/wait');

describe('getIdentityIdByFirstPublicKeyHandlerFactory', function main() {
  this.timeout(200000);

  let removeDapi;
  let dapiClient;
  let dpp;
  let identityCreateTransition;
  let identity;

  before(async () => {
    const {
      dapiCore,
      dashCore,
      remove,
    } = await startDapi();

    removeDapi = remove;

    const coreAPI = dashCore.getApi();
    dapiClient = dapiCore.getApi();

    dpp = new DashPlatformProtocol({
      dataProvider: {},
    });

    const { result: addressString } = await coreAPI.getNewAddress();
    const { result: privateKeyString } = await coreAPI.dumpPrivKey(addressString);

    const privateKey = new PrivateKey(privateKeyString);
    const publicKey = new PublicKey({
      ...privateKey.toPublicKey().toObject(),
      compressed: true,
    });
    const pubKeyBase = publicKey.toBuffer()
      .toString('base64');

    // eslint-disable-next-line no-underscore-dangle
    const publicKeyHash = PublicKey.fromBuffer(Buffer.from(pubKeyBase, 'base64'))
      ._getID();

    await coreAPI.generateToAddress(500, addressString);

    const { result: unspent } = await coreAPI.listUnspent();
    const inputs = unspent.filter(input => input.address === addressString);

    const transaction = new Transaction();

    transaction.from(inputs.slice(-1)[0])
      .addBurnOutput(10000, publicKeyHash)
      .change(addressString)
      .fee(668)
      .sign(privateKey);

    await coreAPI.sendrawtransaction(transaction.serialize());

    await coreAPI.generateToAddress(1, addressString);

    await wait(2000); // wait a couple of seconds for tx to be confirmed

    const outPoint = transaction.getOutPointBuffer(0);

    identity = dpp.identity.create(
      outPoint,
      [publicKey],
    );

    identityCreateTransition = dpp.identity.createIdentityCreateTransition(identity);
    identityCreateTransition.signByPrivateKey(privateKey);

    await dapiClient.platform.broadcastStateTransition(identityCreateTransition.serialize());
  });

  after(async () => {
    await removeDapi();
  });

  it('should fetch created identity', async () => {
    const publicKeyHash = identity.getPublicKeyById(0).hash();

    const identityId = await dapiClient.platform.getIdentityIdByFirstPublicKey(
      publicKeyHash,
    );

    expect(identityId).to.be.not.null();

    expect(identityId).to.equal(identity.getId());
  });

  it('should respond with NOT_FOUND error if identity not found', async () => {
    const publicKeyHash = Buffer.alloc(10).toString('hex');
    const serializedIdentity = await dapiClient.platform.getIdentityIdByFirstPublicKey(
      publicKeyHash,
    );

    expect(serializedIdentity).to.be.null();
  });
});
