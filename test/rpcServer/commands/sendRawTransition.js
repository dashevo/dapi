const { expect } = require('chai');
const sinon = require('sinon');
const sendRawTransitionFactory = require('../../../lib/rpcServer/commands/sendRawTransition');
const coreAPIFixture = require('../../fixtures/coreAPIFixture');
const dashDriveFixture = require('../../fixtures/dashDriveFixture');

let spy;
let stub;
let driveSpy;

const validCloseTransitionHeader = '00000100038096980000000000fece053ccfee6b0e96083af22882ab3a5d420eb033c6adce5f9d70cca7258d3e0000000000000000000000000000000000000000000000000000000000000000411fcc335a9f4e07354662839d65d426a972c27c982ffc9d9c2ddc33f32332dd537e43b55785d07a3eba9431ccd83af7b080c8f725a99f45e06edfe01f7c70b6bcaf00';
const validUpdateTransitionHeader = '00000100018096980000000000fece053ccfee6b0e96083af22882ab3a5d420eb033c6adce5f9d70cca7258d3e0000000000000000000000000000000000000000000000000000000000000000fece053ccfee6b0e96083af22882ab3a5d420eb033c6adce5f9d70cca7258d3e411f1f582cd27c6b03bf460a05bb8903de6be2bbb07c07bf64f1e53821716793d0ad5fe3c236b3c8f8c8e76cbb5dda3ed6430121ffac866b44c4d776ac82fce09e5900';

describe('sendRawTransition', () => {
  describe('#factory', () => {
    it('should return a function', () => {
      const sendRawTransition = sendRawTransitionFactory(coreAPIFixture, dashDriveFixture);
      expect(sendRawTransition).to.be.a('function');
    });
  });

  before(() => {
    spy = sinon.spy(coreAPIFixture, 'sendRawTransition');
    driveSpy = sinon.spy(dashDriveFixture, 'pinPacket');
    stub = sinon.stub(coreAPIFixture, 'getUser').returns({
      // This is valid pubkey id for transition headers from above.
      pubkeyid: '9169981bcf104de7f8617e95cd9205ed85563990',
    });
  });

  beforeEach(() => {
    spy.resetHistory();
    driveSpy.resetHistory();
  });

  after(async () => {
    spy.restore();
    stub.restore();
    driveSpy.restore();
  });

  it('Should return a string', async () => {
    const sendRawTransition = sendRawTransitionFactory(coreAPIFixture, dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    let tsid = await sendRawTransition([validCloseTransitionHeader]);
    expect(tsid).to.be.a('string');
    expect(spy.callCount).to.be.equal(1);
    tsid = await sendRawTransition({ rawTransitionHeader: validCloseTransitionHeader });
    expect(tsid).to.be.a('string');
    expect(spy.callCount).to.be.equal(2);
  });

  it('Should throw if arguments are not valid', async () => {
    const sendRawTransition = sendRawTransitionFactory(coreAPIFixture, dashDriveFixture);
    expect(spy.callCount).to.be.equal(0);
    await expect(sendRawTransition([])).to.be.rejected;
    expect(spy.callCount).to.be.equal(0);
    await expect(sendRawTransition({})).to.be.rejectedWith('should have required property \'rawTransitionHeader\'');
    expect(spy.callCount).to.be.equal(0);
    await expect(sendRawTransition({ rawTransitionHeader: 1 })).to.be.rejectedWith('rawTransitionHeader should be string');
    expect(spy.callCount).to.be.equal(0);
    await expect(sendRawTransition({ rawTransitionHeader: 'thisisnotvalidhex' })).to.be.rejectedWith('rawTransitionHeader should match pattern "^(0x|0X)?[a-fA-F0-9]+$"');
    expect(spy.callCount).to.be.equal(0);
  });
});
