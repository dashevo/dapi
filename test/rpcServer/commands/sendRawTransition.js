const chai = require('chai');
const sinon = require('sinon');

const chaiAsPromised = require('chai-as-promised');
const dirtyChai = require('dirty-chai');
const sinonChai = require('sinon-chai');

const sendRawTransitionFactory = require('../../../lib/rpcServer/commands/sendRawTransition');

const coreAPIFixture = require('../../fixtures/coreAPIFixture');
const dashDriveFixture = require('../../fixtures/dashDriveFixture');

chai.use(chaiAsPromised);
chai.use(dirtyChai);
chai.use(sinonChai);

const { expect } = chai;

describe('sendRawTransition', () => {
  let sendRawTransactionSpy;
  let addSTPacketSpy;

  describe('#factory', () => {
    it('should return a function', () => {
      const sendRawTransaction = sendRawTransitionFactory(coreAPIFixture, dashDriveFixture);
      expect(sendRawTransaction).to.be.a('function');
    });
  });

  before(() => {
    sendRawTransactionSpy = sinon.spy(coreAPIFixture, 'sendRawTransaction');
    addSTPacketSpy = sinon.spy(dashDriveFixture, 'addSTPacket');
  });

  beforeEach(() => {
    sendRawTransactionSpy.resetHistory();
    addSTPacketSpy.resetHistory();
  });

  after(async () => {
    sendRawTransactionSpy.restore();
    addSTPacketSpy.restore();
  });

  it('should return a transaction ID', async () => {
    const rawTransitionHeader = '0AFF';
    const rawTransitionPacket = '0BFF';

    const sendRawTransition = sendRawTransitionFactory(coreAPIFixture, dashDriveFixture);

    expect(addSTPacketSpy).to.have.not.been.called();
    expect(sendRawTransactionSpy).to.have.not.been.called();

    const txid = await sendRawTransition({
      rawTransitionHeader,
      rawTransitionPacket,
    });

    expect(txid).to.be.a('string');

    expect(addSTPacketSpy).to.have.been.calledOnceWith(rawTransitionPacket, rawTransitionHeader);
    expect(sendRawTransactionSpy).to.have.been.calledOnceWith(rawTransitionHeader);
  });

  it('should throw error if arguments are not valid', async () => {
    const assertions = [
      // Pass array
      {
        params: [],
        message: '',
      },
      // Pass empty object
      {
        params: {},
        message: 'should have required property \'rawTransitionHeader\'',
      },
      // Pass rawTransitionHeader as a number
      {
        params: { rawTransitionHeader: 1 },
        message: 'rawTransitionHeader should be string',
      },
      // Pass rawTransitionHeader as a usual string
      {
        params: { rawTransitionHeader: 'string' },
        message: 'rawTransitionHeader should match pattern "^(0x|0X)?[a-fA-F0-9]+$"',
      },
      // Pass rawTransitionHeader as a hex string but without rawTransitionPacket
      {
        params: { rawTransitionHeader: '0BFF' },
        message: 'params should have required property \'rawTransitionPacket\'',
      },
      // Pass rawTransitionPacket as a number
      {
        params: { rawTransitionHeader: '0BFF', rawTransitionPacket: 1 },
        message: 'rawTransitionPacket should be string',
      },
      // Pass rawTransitionPacket as a number
      {
        params: { rawTransitionHeader: '0BFF', rawTransitionPacket: 'string' },
        message: 'rawTransitionPacket should match pattern "^(0x|0X)?[a-fA-F0-9]+$"',
      },
    ];

    const sendRawTransition = sendRawTransitionFactory(coreAPIFixture, dashDriveFixture);

    expect(addSTPacketSpy).to.have.not.been.called();
    expect(sendRawTransactionSpy).to.have.not.been.called();

    // eslint-disable-next-line no-restricted-syntax
    for (const { params, message } of assertions) {
      // eslint-disable-next-line no-await-in-loop
      await expect(sendRawTransition(params)).to.be.rejectedWith(message);

      expect(addSTPacketSpy).to.have.not.been.called();
      expect(sendRawTransactionSpy).to.have.not.been.called();
    }
  });
});
