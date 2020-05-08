const os = require('os');
const path = require('path');
const { promises: fs } = require('fs');
const startDapi = require('@dashevo/dp-services-ctl/lib/services/startDapi');

describe('checkVersion', function main() {
  this.timeout(160000);

  let removeDapi;
  let dapiClient;
  let tmpPackageJson;

  beforeEach(async () => {
    const rawPackageJson = await fs.readFile(path.join(__dirname, '../../../../../package.json'), 'utf8');
    const packageJson = JSON.parse(rawPackageJson);
    packageJson.version = '666.666.666';
    tmpPackageJson = path.join(os.tmpdir(), 'dapiTmpPackage.json');

    await fs.writeFile(tmpPackageJson, JSON.stringify(packageJson), 'utf8');
    const rootPath = process.cwd();

    const dapiContainerOptions = {
      volumes: [
        `${rootPath}/lib:/usr/src/app/lib`,
        `${rootPath}/scripts:/usr/src/app/scripts`,
        `${tmpPackageJson}:/usr/src/app/package.json`,
      ],
    };

    const dapiOptions = {
      cacheNodeModules: false,
      container: dapiContainerOptions,
    };

    const {
      dapiCore,
      remove,
    } = await startDapi({
      dapi: dapiOptions,
    });

    removeDapi = remove;

    dapiClient = dapiCore.getApi();
  });

  afterEach(async () => {
    await fs.unlink(tmpPackageJson);
    await removeDapi();
  });

  it('should throw versions mismatch error', async () => {
    try {
      await dapiClient.getStatus();
      expect.fail('Should throw FAILED_PRECONDITION error');
    } catch (e) {
      expect(e.message).to.equal('9 FAILED_PRECONDITION: Failed precondition: client and server versions mismatch');
      expect(e.code).to.equal(9);
    }
  });
});
