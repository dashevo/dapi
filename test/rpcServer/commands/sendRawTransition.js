const chai = require('chai');
const Schema = require('@dashevo/dash-schema');
const { PrivateKey, Transaction } = require('@dashevo/dashcore-lib');

const { expect } = chai;

const { createStateTransition } = require('../../../lib/rpcServer/commands/sendRawTransition');

describe('sendRawTransition', () => {
  describe('#createStateTransition', () => {
    it('should throw an error when no stateTransitionDataPacket given as an argument');
    it('should throw an error when the hash of the data packet does not match the hash in header');
    it('should return a stateTransition', () => {
      const rawTransitionHeader = '03000c00000000000000ac01003c0a168a4d512742516a80a94293ad86ab2cb547415e8b96719a89f91048dfd03c0a168a4d512742516a80a94293ad86ab2cb547415e8b96719a89f91048dfd0e8030000000000003a0a168a4d512742516a80a94293ad86ab2cb547415e8b96719a89f91048dfa0411f3ae683b0a3ac3c3342ab30e646df344e8c3648902b48c5cb5f29c17f15a43ad93943b49c1f83a06321c6c434ae1c73d22ae83da3d39b9c5ce98a7947f5deab90';
      const headerTransaction = new Transaction(rawTransitionHeader);
      const packet = Schema.create.tspacket();
      const rawTransitionDataPacket = packet;
      // eslint-disable-next-line no-underscore-dangle
      const packetHash = Schema.hash.tspacket(packet);
      headerTransaction.extraPayload.setHashSTPacket(packetHash);
      const privateKey = new PrivateKey();
      headerTransaction.extraPayload.sign(privateKey);

      const expected = {
        headerTransaction,
        packet,
      };

      const actual =
        createStateTransition({ rawTransitionHeader, rawTransitionDataPacket });
      expect(actual).to.be.deepEqual(expected);
    });
  });
});
