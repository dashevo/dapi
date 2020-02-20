const {
  startDapi,
} = require('@dashevo/dp-services-ctl');

const { Block } = require('@dashevo/dashcore-lib');

describe('getBlockHandlerFactory', function main() {
  this.timeout(200000);

  let removeDapi;
  let dapiClient;
  let blockHash;
  let blockHeight;

  beforeEach(async () => {
    const {
      dapiCore,
      dashCore,
      remove,
    } = await startDapi();

    removeDapi = remove;

    dapiClient = dapiCore.getApi();
    const coreAPI = dashCore.getApi();

    await coreAPI.generate(500);

    ({ result: blockHash } = await coreAPI.getbestblockhash());
    blockHeight = 100;
  });

  afterEach(async () => {
    await removeDapi();
  });

  it('should get block by hash', async () => {
    const blockBinary = await dapiClient.getBlockByHash(blockHash);

    expect(blockBinary).to.be.an.instanceof(Buffer);
    const block = new Block(blockBinary);

    expect(block.toBuffer()).to.deep.equal(blockBinary);
  });

  it('should get block by height', async () => {
    const blockBinary = await dapiClient.getBlockByHeight(blockHeight);

    expect(blockBinary).to.be.an.instanceof(Buffer);
    const block = new Block(blockBinary);

    expect(block.toBuffer()).to.deep.equal(blockBinary);
  });
});
