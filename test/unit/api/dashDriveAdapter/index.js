const chai = require('chai');
const sinon = require('sinon');

const chaiAsPromised = require('chai-as-promised');
const dirtyChai = require('dirty-chai');

const DashDriveAdapter = require('../../../../lib/externalApis/dashDriveAdapter');

chai.use(chaiAsPromised);
chai.use(dirtyChai);

const { expect } = chai;

describe('DashDriveAdapter', () => {
  describe('constructor', () => {
    it('Should create dash drive client with given options', () => {
      const dashDrive = new DashDriveAdapter({ host: '127.0.0.1', port: 3000 });

      expect(dashDrive.client.options.host).to.be.equal('127.0.0.1');
      expect(dashDrive.client.options.port).to.be.equal(3000);
    });
  });

  describe('#addSTPacket', () => {
    it('Should call \'addStPacket\' RPC with the given parameters', async () => {
      const dashDrive = new DashDriveAdapter({ host: '127.0.0.1', port: 3000 });

      const rawSTPacket = 'stPacket';
      const rawStateTransition = 'stateTransition';
      const method = 'addSTPacket';

      sinon.stub(dashDrive.client, 'request')
        .withArgs(method, { stateTransition: rawStateTransition, stPacket: rawSTPacket })
        .returns(Promise.resolve({ result: undefined }));

      expect(dashDrive.client.request.callCount).to.be.equal(0);

      const result = await dashDrive.addSTPacket(rawStateTransition, rawSTPacket);

      expect(dashDrive.client.request.callCount).to.be.equal(1);
      expect(result).to.be.undefined();
    });
  });

  describe('#fetchDPContract', () => {
    it('Should call \'fetchDPContract\' RPC with the given parameters', async () => {
      const dashDrive = new DashDriveAdapter({ host: '127.0.0.1', port: 3000 });

      const contractId = 'contractId';
      const method = 'fetchDPContract';

      const expectedDapContract = { contractId };

      sinon.stub(dashDrive.client, 'request')
        .withArgs(method, { contractId })
        .returns(Promise.resolve({ result: expectedDapContract }));

      expect(dashDrive.client.request.callCount).to.be.equal(0);

      const actualDapContract = await dashDrive.fetchDapContract(contractId);

      expect(dashDrive.client.request.callCount).to.be.equal(1);
      expect(actualDapContract).to.be.equal(expectedDapContract);
      expect(actualDapContract).not.to.be.equal({ contractId: 'randomid' });
    });
  });

  describe('#fetchDPObjects', () => {
    it('Should call \'fetchDPObjects\' RPC with the given parameters', async () => {
      const dashDrive = new DashDriveAdapter({ host: '127.0.0.1', port: 3000 });

      const contractId = 'contractId';
      const type = 'contact';
      const options = { where: { id: 1 } };
      const method = 'fetchDPObjects';

      const expectedDapObjects = [{ contractId, id: 1 }];


      sinon.stub(dashDrive.client, 'request')
        .withArgs(method, { contractId, type, options })
        .returns(Promise.resolve({ result: expectedDapObjects }));

      expect(dashDrive.client.request.callCount).to.be.equal(0);

      const actualDapObjects = await dashDrive.fetchDapObjects(contractId, type, options);

      expect(dashDrive.client.request.callCount).to.be.equal(1);
      expect(actualDapObjects).to.be.equal(expectedDapObjects);
      expect(actualDapObjects).not.to.be.equal([{ contractId, id: 2 }]);
    });
  });
});
