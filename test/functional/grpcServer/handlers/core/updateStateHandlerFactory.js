const {
  startDapi,
} = require('@dashevo/dp-services-ctl');

const {
  UpdateStateTransitionResponse,
} = require('@dashevo/dapi-grpc');

const DataContractStateTransition = require(
  '@dashevo/dpp/lib/dataContract/stateTransition/DataContractStateTransition',
);

const getDataContractFixture = require(
  '@dashevo/dpp/lib/test/fixtures/getDataContractFixture',
);

describe('updateStateHandlerFactory', function main() {
  this.timeout(160000);

  let removeDapi;
  let dapiClient;
  let driveClient;
  let stateTransition;

  beforeEach(async () => {
    const {
      driveApi,
      dapiCore,
      remove,
    } = await startDapi();

    removeDapi = remove;

    dapiClient = dapiCore.getApi();
    driveClient = driveApi.getApi();

    const dataContract = getDataContractFixture();

    stateTransition = new DataContractStateTransition(dataContract);
  });

  afterEach(async () => {
    await removeDapi();
  });

  it('should respond with valid result and store contract', async () => {
    const result = await dapiClient.updateState(stateTransition);
    const contractId = stateTransition.getDataContract().getId();
    const { result: contract } = await driveClient.request('fetchContract', { contractId });

    expect(result).to.be.an.instanceOf(UpdateStateTransitionResponse);
    expect(contract).to.deep.equal(stateTransition.getDataContract().toJSON());
  });
});
