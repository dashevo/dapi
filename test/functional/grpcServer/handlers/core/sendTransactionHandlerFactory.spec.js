const {
  startDapi,
} = require('@dashevo/dp-services-ctl');

const {
  PrivateKey,
  Transaction,
} = require('@dashevo/dashcore-lib');

describe('sendTransactionHandlerFactory', function main() {
  this.timeout(200000);

  let removeDapi;
  let dapiClient;
  let transaction;
  let toAddress;

  beforeEach(async () => {
    const {
      dapiCore,
      dashCore,
      remove,
    } = await startDapi();

    removeDapi = remove;

    const coreAPI = dashCore.getApi();
    dapiClient = dapiCore.getApi();

    const { result: fromAddress } = await coreAPI.getNewAddress();
    const { result: privateKeyString } = await coreAPI.dumpPrivKey(fromAddress);
    const privateKey = new PrivateKey(privateKeyString);


    await coreAPI.generateToAddress(500, fromAddress);

    const { result: unspent } = await coreAPI.listUnspent();
    const inputs = unspent.filter(input => input.address === fromAddress);

    const amount = 10000;

    transaction = new Transaction();

    transaction.from(inputs)
      .to(toAddress, amount)
      .change(fromAddress)
      .fee(668)
      .sign(privateKey);
  });

  afterEach(async () => {
    await removeDapi();
  });

  it('should sent transaction and return transaction ID', async () => {
    const options = {};

    const result = await dapiClient.sendTransaction(Buffer.from(transaction.serialize(), 'hex'), options);

    expect(result).to.be.a('string');
  });
});
