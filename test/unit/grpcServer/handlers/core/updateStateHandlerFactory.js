const { expect, use } = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const dirtyChai = require('dirty-chai');
const chaiAsPromised = require('chai-as-promised');

const cbor = require('cbor');

const {
  UpdateStateTransitionResponse,
} = require('@dashevo/dapi-grpc');

const getStPacketFixture = require('../../../../../lib/test/fixtures/getStPacketFixture');
const getStHeaderFixture = require('../../../../../lib/test/fixtures/getStHeaderFixture');
const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

const updateStateHandlerFactory = require(
  '../../../../../lib/grpcServer/handlers/core/updateStateHandlerFactory',
);
const InvalidArgumentGrpcError = require('../../../../../lib/grpcServer/error/InvalidArgumentGrpcError');
const InternalGrpcError = require('../../../../../lib/grpcServer/error/InternalGrpcError');

use(sinonChai);
use(chaiAsPromised);
use(dirtyChai);

describe('updateStateHandlerFactory', () => {
  let call;
  let rpcClientMock;
  let updateStateHandler;
  let response;
  let stHeader;
  let stPacket;
  let log;

  beforeEach(function beforeEach() {
    if (!this.sinon) {
      this.sinon = sinon.createSandbox();
    } else {
      this.sinon.restore();
    }

    const stPacketFixture = getStPacketFixture();
    const stHeaderFixture = getStHeaderFixture(stPacketFixture);

    stHeader = Buffer.from(stHeaderFixture.serialize(), 'hex');
    stPacket = stPacketFixture.serialize();

    call = new GrpcCallMock(this.sinon, {
      getHeader: this.sinon.stub().returns(stHeader),
      getPacket: this.sinon.stub().returns(stPacket),
    });

    log = JSON.stringify({
      error: {
        message: 'some message',
        data: 'some data',
      },
    });

    response = {
      check_tx: log,
      deliver_tx: log,
      hash:
        'B762539A7C17C33A65C46727BFCF2C701390E6AD7DE5190B6CC1CF843CA7E262',
      height: '24',
    };

    rpcClientMock = {
      request: this.sinon.stub().resolves(response),
    };

    updateStateHandler = updateStateHandlerFactory(
      rpcClientMock,
    );
  });

  afterEach(function afterEach() {
    this.sinon.restore();
  });

  it('should throw an error if header is not specified', async () => {
    call.request.getHeader.returns(null);

    try {
      await updateStateHandler(call);

      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: header is not specified');
    }
  });

  it('should throw an error if packet is not specified', async () => {
    call.request.getPacket.returns(null);

    try {
      await updateStateHandler(call);

      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: packet is not specified');
    }
  });

  it('should return valid result', async () => {
    const result = await updateStateHandler(call);

    const st = {
      header: Buffer.from(stHeader).toString('hex'),
      packet: Buffer.from(stPacket),
    };

    const tx = cbor.encode(st).toString('base64');

    expect(result).to.be.an.instanceOf(UpdateStateTransitionResponse);
    expect(rpcClientMock.request).to.be.calledOnceWith('broadcast_tx_commit', { tx });
  });

  it('should throw InvalidArgumentGrpcError if Tendermint Core returns check_tx with non zero code', async () => {
    rpcClientMock.request.resolves({
      check_tx: { code: 1, log },
      deliver_tx: { log },
      hash:
        'B762539A7C17C33A65C46727BFCF2C701390E6AD7DE5190B6CC1CF843CA7E262',
      height: '24',
    });

    try {
      await updateStateHandler(call);

      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: some message');
      expect(e.getMetadata()).to.equal('some data');
    }
  });

  it('should throw InvalidArgumentGrpcError if Tendermint Core returns deliver_tx with non zero code', async () => {
    rpcClientMock.request.resolves({
      check_tx: { log },
      deliver_tx: { code: 1, log },
      hash:
        'B762539A7C17C33A65C46727BFCF2C701390E6AD7DE5190B6CC1CF843CA7E262',
      height: '24',
    });

    try {
      await updateStateHandler(call);

      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InvalidArgumentGrpcError);
      expect(e.getMessage()).to.equal('Invalid argument: some message');
      expect(e.getMetadata()).to.equal('some data');
    }
  });

  it('should return error if timeout happened', async () => {

  });

  it('should return InternalGrpcError if Tendermint Core throws an error', async () => {
    rpcClientMock.request.throws(new Error('Test error'));

    try {
      await updateStateHandler(call);

      expect.fail('Error was not thrown');
    } catch (e) {
      expect(e).to.be.an.instanceOf(InternalGrpcError);
      expect(e.getMessage()).to.equal('Internal error');
    }
  });
});
