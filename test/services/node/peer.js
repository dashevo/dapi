const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
var Peer = require('../../../lib/services/node/peer');

const {expect} = chai;

describe('services/node/peer', () => {
    const knownPeerWithUrl =
        {
            pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000',
            rep: {uri: '127.0.0.1:40000'},
            pub: {uri: '127.0.0.1:50000'},
        };
    const knownPeer =
        {
            pubKey: 'XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000',
            rep: {host: '127.0.0.1', port: 40000},
            pub: {host: '127.0.0.1', port: 50000},
        };
    describe('#factory', () => {
        it('should not create Peer instance without data', () => {
            expect(() => new Peer()).to.throw('Impossible to create such a peer without any data.');
        });
        it('should not create Peer instance without pubKey', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeerWithUrl));
            delete copyKnownPeer['pubKey'];
            expect(() => new Peer(copyKnownPeer)).to.throw('Peer\'s pubKey missing');
        });
        it('should not create Peer instance without rep.port', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeer));
            delete copyKnownPeer['rep']['port'];
            expect(() => new Peer(copyKnownPeer)).to.throw('REP.URI missing');
        });
        it('should not create Peer instance without rep.host', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeer));
            delete copyKnownPeer['rep']['host'];
            expect(() => new Peer(copyKnownPeer)).to.throw('REP.URI missing');
        });
        it('should not create Peer instance without pub.url', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeerWithUrl));
            delete copyKnownPeer['pub']['uri'];
            expect(() => new Peer(copyKnownPeer)).to.throw('PUB.URI missing');
        });
        it('should not create Peer instance without pub.port', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeer));
            delete copyKnownPeer['pub']['port'];
            expect(() => new Peer(copyKnownPeer)).to.throw('PUB.URI missing');
        });
        it('should not create Peer instance without pub.host', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeer));
            delete copyKnownPeer['pub']['host'];
            expect(() => new Peer(copyKnownPeer)).to.throw('PUB.URI missing');
        });
        it('should not create Peer instance without rep.url', () => {
            let copyKnownPeer = JSON.parse(JSON.stringify(knownPeerWithUrl));
            delete copyKnownPeer['rep']['uri'];
            expect(() => new Peer(copyKnownPeer)).to.throw('REP.URI missing');
        });
        it('should not create Peer instance with valid data', () => {
            const res = new Peer(knownPeer);
            expect(res).to.be.instanceof(Peer);
        });
        it('should not create Peer instance with valid data', () => {
            const res = new Peer(knownPeerWithUrl);
            expect(res).to.be.instanceof(Peer);
        });
        it('should Peer has disconnect function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.disconnect;
            expect(res).to.be.a("function");
        });
        it('should Peer call disconnect function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.disconnect();
            expect(res).to.be.a("undefined");
        });
        it('should Peer has sendPing function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.sendPing;
            expect(res).to.be.a("function");
        });
        it('should Peer call sendPing function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.sendPing();
            expect(res).to.be.a("undefined");
        });
        it('should Peer has sendIdentity function', () => {
            const peer = new Peer(knownPeer);
            res = peer.sendIdentity;
            expect(res).to.be.a("function");
        });
        it('should Peer call sendIdentity function', () => {
            const peer = new Peer(knownPeer);
            res = peer.sendIdentity("data");
            expect(res).to.be.a("undefined");
        });
        it('should Peer has askPeerList function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.askPeerList;
            expect(res).to.be.a("function");
        });
        it('should Peer call askPeerList function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.askPeerList();
            expect(res).to.be.a("undefined");
        });
        it('should Peer has connect function', () => {
            const peer = new Peer(knownPeer);
            const res = peer.connect;
            expect(res).to.be.a("function");
        });
        it('should not Peer call connect twice', () => {
            const peer = new Peer(knownPeer);
            const res = peer.connect();
            expect(res).to.be.equals(true);
            expect(() => peer.connect()).to.throw('Peer connection already established !');
        });
        xit('should Peer call connect after disconnect', () => { //TODO fill the ticket
            const peer = new Peer(knownPeer);
            const res = peer.connect();
            expect(res).to.be.equals(true);
            const resD = peer.disconnect();
            expect(resD).to.be.equals(undefined);
            const res2 = peer.connect();
            expect(res2).to.be.equals(true);
        });
    });
});