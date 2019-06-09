const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

const getLastStateTransitionHashHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/core/getLastUserStateTransitionHashHandlerFactory',
);

const InvalidArgumentError = require('../../../../../lib/grpcServer/error/InvalidArgumentError');

use(sinonChai);
use(chaiAsPromised);
use(dirtyChai);

describe('getLastStateTransitionHashHandlerFactory', () => {
  let coreAPIMock;
  let getLastStateTransitionHashHandler;

  beforeEach(function beforeEach() {
    if (!this.sinon) {
      this.sinon = sinon.createSandbox();
    } else {
      this.sinon.restore();
    }
  });

  afterEach(function afterEach() {
    this.sinon.restore();
  });

  beforeEach(function beforeEach() {
    coreAPIMock = {
      getUser: this.sinon.stub(),
    };

    getLastStateTransitionHashHandler = getLastStateTransitionHashHandlerFactory(
      coreAPIMock,
    );
  });

  it('should throw an error if user was not found', function it(done) {
    const userId = 'nonExistentUserId';

    const call = new GrpcCallMock(this.sinon, {
      getUserId: () => userId,
    });

    const callback = (e, v) => {
      try {
        expect(coreAPIMock.getUser).to.have.been.calledOnceWith(userId);

        expect(v).to.equal(null);
        expect(e).to.be.an.instanceOf(InvalidArgumentError);
        expect(e.getMessage()).to.equal(`Invalid argument: User was not found by id ${userId}`);

        done();
      } catch (error) {
        done(error);
      }
    };

    coreAPIMock.getUser.resolves(undefined);

    getLastStateTransitionHashHandler(call, callback);
  });

  it('should throw-forward an error if core API call goes wrong', function it() {
    const userId = 'someUserId';

    const call = new GrpcCallMock(this.sinon, {
      getUserId: () => userId,
    });

    const callback = this.sinon.stub();

    const anError = new Error('Core API goes nuts');

    coreAPIMock.getUser.throws(anError);

    try {
      getLastStateTransitionHashHandler(call, callback);
      expect.fail('An error have not been thrown');
    } catch (e) {
      expect(e.message).to.equal(anError.message);
    }

    expect(callback).to.not.have.been.called();
  });

  it('should return regTxId in case no state transitions exist', function it(done) {
    const userId = 'someUserId';

    const call = new GrpcCallMock(this.sinon, {
      getUserId: () => userId,
    });

    const callback = (e, v) => {
      try {
        expect(e).to.equal(null);
        expect(v.getRegTxId()).to.equal(userId);
        expect(v.getLastStateTransitionHash()).to.equal('');
        done();
      } catch (error) {
        done(error);
      }
    };

    coreAPIMock.getUser.resolves({
      subtx: [],
    });

    getLastStateTransitionHashHandler(call, callback);
  });

  it('should return last state transitions hash', function it(done) {
    const userId = 'someUserId';
    const subTxs = [
      'one',
      'two',
      'three',
    ];

    const call = new GrpcCallMock(this.sinon, {
      getUserId: () => userId,
    });

    const callback = (e, v) => {
      try {
        expect(e).to.equal(null);
        expect(v.getRegTxId()).to.equal('');
        expect(v.getLastStateTransitionHash()).to.equal(subTxs[subTxs.length - 1]);
        done();
      } catch (error) {
        done(error);
      }
    };

    coreAPIMock.getUser.resolves({
      subtx: subTxs,
    });

    getLastStateTransitionHashHandler(call, callback);
  });
});
