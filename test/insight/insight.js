const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const request = require('request-promise-native');

chai.use(chaiAsPromised);
const { expect } = chai;

const insight = require('../../lib/api/insight');

// TODO: Unit tests need to be written
describe('Insight', () => {});

// TODO: Integration tests need to be migrated to another level
xdescribe('Insight - Integration', () => {
  describe('#getAddress(txHash)', () => {
    const txHash = '50622f66236671501c0e80f388d6cf1e81158de8526f4acc9db00adf3c524077';
    it('should return address', () => insight.getAddress(txHash).then((address) => {
      expect(address).to.be.a('string');
    }));
  });

  describe('#getUser', () => {
    const validUserData = {
      result: {
        uname: 'Alice',
        regtxid: 'b65115c453394fd309582ddae07a53453f1481fdb1b637d20cec1f0baac1f6c3',
        pubkey: '02cc389b4dbbe122e3842b4f6c07791801eb4c4d56cff48f6851cd873559eed8b3',
        credits: 1000000,
        subtx: [
          'b65115c453394fd309582ddae07a53453f1481fdb1b637d20cec1f0baac1f6c3',
        ],
        state: 'open',
      },
    };
    const requestStub = sinon.stub(request, 'get');
    requestStub.rejects(new Error('user not found. Code:-1'));
    requestStub
      .withArgs(`${insight.URI}/getuser/Alice`)
      .returns(new Promise(resolve => resolve(validUserData)));

    it('Should return user if such user exists on blockchain', async () => {
      const user = await insight.getUser('Alice');
      expect(user.uname).to.be.equal('Alice');
      expect(user.regtxid).to.be.equal(validUserData.result.regtxid);
      expect(user.pubkey).to.be.equal(validUserData.result.pubkey);
      expect(user.credits).to.be.equal(validUserData.result.credits);
      expect(user.subtx).to.be.equal(validUserData.result.subtx);
      expect(user.state).to.be.equal(validUserData.result.state);
    });

    it('Should return error if user not found', () => expect(insight.getUser('Bob')).to.be.rejected);

    after(() => { requestStub.restore(); });
  });
});
