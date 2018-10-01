const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Pool = require('../../../lib/services/node/pool');
const Peer = require('../../../lib/services/node/peer');

const { expect } = chai;

describe('services/node/peer', () => {
  const knownPeer = {
    pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000',
    rep: { host: '127.0.0.1', port: 40000 },
    pub: { host: '127.0.0.1', port: 50000 },
  };
  const peerConfig = {
    pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40001',
    privKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40002',
    rep: {
      uri: '127.0.0.1:40000',
    },
    pub: {
      uri: '127.0.0.1:50000',
    },
  };
  describe('#factory', () => {
    it('should not create Pool instance without data', () => {
      expect(() => new Pool()).to.throw('Cannot read property \'pubKey\' of undefined');
    });
    xit('should not create Peer instance without pubKey', () => { // TODO post ticket
      const copyPeerConfig = JSON.parse(JSON.stringify(peerConfig));
      delete copyPeerConfig.pubKey;
      expect(() => new Pool(copyPeerConfig)).to.throw('Peer\'s pubKey missing');
    });
    xit('should not create Peer instance without privKey', () => { // TODO post ticket + more tests add
      const copyPeerConfig = JSON.parse(JSON.stringify(peerConfig));
      delete copyPeerConfig.privKey;
      expect(() => new Pool(copyPeerConfig)).to.throw('Peer\'s pubKey missing');
    });

    it('should create Pool instance with valid data', () => {
      const res = new Pool(peerConfig);
      expect(res).to.be.instanceof(Pool);
    });
    it('should Pool has isKnownPeer functio', () => {
      const pool = new Pool(peerConfig);
      const res = pool.isKnownPeer;
      expect(res).to.be.a('function');
    });
    it('should not Pool call isKnownPeer function without param', () => {
      const pool = new Pool(peerConfig);
      expect(() => pool.isKnownPeer()).to.throw('Trying to check if non peer is known.');
    });
    it('should Pool call isKnownPeer function with valid param', () => {
      const pool = new Pool(peerConfig);
      const peer = new Peer(knownPeer);
      const res = pool.isKnownPeer(peer);
      expect(res).to.be.equals(true);
    });
    it('should Pool has addPeer function', () => {
      const pool = new Pool(peerConfig);
      const res = pool.addPeer;
      expect(res).to.be.a('function');
    });
    it('should not Pool call addPeer function without param', () => {
      const pool = new Pool(peerConfig);
      expect(() => pool.addPeer()).to.throw('Trying to add non peer.');
    });
    it('should Pool call addPeer function with valid param', () => {
      const pool = new Pool(peerConfig);
      const peer = new Peer(knownPeer);
      const res = pool.addPeer(peer);
      expect(res).to.be.a('undefined');
    });
    it('should Pool has handleNewPeerAnnounced functio', () => {
      const pool = new Pool(peerConfig);
      const res = pool.handleNewPeerAnnounced;
      expect(res).to.be.a('function');
    });
    it('should Pool call handleNewPeerAnnounced function without param', () => {
      const pool = new Pool(peerConfig);
      const res = pool.handleNewPeerAnnounced();
      expect(res).to.be.a('undefined');
    });
    it('should Pool has getList function', () => {
      const pool = new Pool(peerConfig);
      const res = pool.getList;
      expect(res).to.be.a('function');
    });
    it('should Pool getList return undefined when ', () => { // TODO
      const pool = new Pool(peerConfig);
      const res = pool.getList();
      expect(res).to.deep.equal([{
        pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000',
        pub: {
          host: '127.0.0.1',
          port: '50000',
        },
        rep: {
          host: '127.0.0.1',
          port: '40000',
        },
      }]);
    });
    it('should Pool call getList function with valid param', () => {
      const pool = new Pool(peerConfig);
      const peer = new Peer(knownPeer);
      pool.addPeer(peer);
      const res = pool.getList(peer);
      expect(res).to.deep.equal([
        {
          pub: {
            host: '127.0.0.1',
            port: '50000',
          },
          pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000',
          rep: {
            host: '127.0.0.1',
            port: '40000',
          },
        },
        {
          pub: {
            host: '127.0.0.1',
            port: '50000',
          },
          pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000',
          rep: {
            host: '127.0.0.1',
            port: '40000',
          },
        },
      ]);
    });
  });
});
