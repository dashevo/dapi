const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const getTransitionsFactory = require('../../../../lib/rpcServer/commands/getTransitions');
const coreAPI = require('../../../../lib/externalApis/dashcore/rpc');
const DashCoreRpcError = require('../../../../lib/errors/DashCoreRpcError');

chai.use(chaiAsPromised);
const { expect } = chai;
let getTransactionStub;
let getUserStub;

function getUserTransitionHashes() {
  return [
    'bbef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2cc',
    'aaef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2bb',
    'ccef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2dd',
  ];
}

function getValidUserId() {
  return 'beef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2aa';
}

function getNonExistentUserId() {
  return 'aaef56cc3cff03a48d078fd7839c05ec16f12f1919ac366596bb5e025f78a2bb';
}

describe('getTransitions', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const getTransactionById = getTransitionsFactory(coreAPI);
      expect(getTransactionById).to.be.a('function');
    });
  });

  before(() => {
    getTransactionStub = sinon.stub(coreAPI, 'getTransaction');
    getUserTransitionHashes().forEach((transitionHash) => {
      getTransactionStub.withArgs(transitionHash).returns({ txid: transitionHash });
    });
    getUserStub = sinon.stub(coreAPI, 'getUser')
      .withArgs(getValidUserId())
      .returns({ subtx: getUserTransitionHashes() })
      .withArgs(getNonExistentUserId())
      .throws(new DashCoreRpcError('User not found'));
  });

  beforeEach(() => {
    getTransactionStub.resetHistory();
    getUserStub.resetHistory();
  });

  after(async () => {
    getTransactionStub.restore();
    getUserStub.restore();
  });

  it('Should return an array', async () => {
    const getTransitions = getTransitionsFactory(coreAPI);
    expect(getTransactionStub.callCount).to.be.equal(0);
    expect(getUserStub.callCount).to.be.equal(0);
    const transaction = await getTransitions({ userId: getValidUserId() });
    expect(transaction).to.be.an('object');
    expect(getTransactionStub.callCount).to.be.equal(1);
  });

  it('Should paginate', async () => {
    const getTransitions = getTransitionsFactory(coreAPI);
    const firstTwoTransitions = await getTransitions({ userId: getValidUserId(), from: 0, limit: 2 });
    const secondTransition = await getTransitions({ userId: getValidUserId(), from: 1, limit: 1 });
    const lastTwoTransitions = await getTransitions({ userId: getValidUserId(), from: 1, limit: 2 });
    expect(firstTwoTransitions).to.be.deep.equal({
      totalCount: 3,
      transitions: [
        {
          txid: getUserTransitionHashes()[0],
        },
        {
          txid: getUserTransitionHashes()[1],
        },
      ],
    });
    expect(secondTransition).to.be.deep.equal({
      totalCount: 3,
      transitions: [
        {
          txid: getUserTransitionHashes()[1],
        },
      ],
    });
    expect(lastTwoTransitions).to.be.deep.equal({
      totalCount: 3,
      transitions: [
        {
          txid: getUserTransitionHashes()[1],
        },
        {
          txid: getUserTransitionHashes()[2],
        },
      ],
    });
  });

  it('Should throw if limit is less than 1 or more than 20', async () => {
    const getTransitions = getTransitionsFactory(coreAPI);
    await expect(getTransitions({ userId: getValidUserId(), limit: 0 })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), limit: -10 })).to.be.rejectedWith('some string');
    await (getTransitions({ userId: getValidUserId(), limit: 21 })).to.be.rejectedWith('some string');
  });

  it('Should throw if from lesser than 0', async () => {
    const getTransitions = getTransitionsFactory(coreAPI);
    expect(getTransitions({ userId: getValidUserId(), from: -1 })).to.be.rejectedWith('some string');
  });

  it('Should throw if from or limit is not an integer', async () => {
    const getTransitions = getTransitionsFactory(coreAPI);
    await expect(getTransitions({ userId: getValidUserId(), limit: '0' })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), limit: {} })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), limit: [] })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), limit: true })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), limit: NaN })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), from: '0' })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), from: {} })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), from: [] })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), from: true })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: getValidUserId(), from: NaN })).to.be.rejectedWith('some string');
  });

  it('Should throw if userId is not a string or not present at all', async () => {
    const getTransitions = getTransitionsFactory(coreAPI);
    await expect(getTransitions({ userId: {} })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: 1 })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: [] })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: true })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: NaN })).to.be.rejectedWith('some string');
    await expect(getTransitions({ userId: null })).to.be.rejectedWith('some string');
    await expect(getTransitions({ })).to.be.rejectedWith('some string');
  });
});
