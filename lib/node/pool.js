/*
 * pool.js - DAPI Pool Class
 * Manage the pool of peers
 */
const _ = require('lodash');
const Peer = require('./peer');
class Pool {
    constructor(config) {
        this.peers = {
            list: [],
            inbound: [],
            outbound: []
        }
        this.config = config;
        this.constructKnownPeers();
    }

    constructKnownPeers() {
        const knownPeers = [
            {
                pubKey: "XkifrWK9yHVzXLgeAaqjhjDJuFad6b40000",
                rep: {uri: '127.0.0.1:40000'},
                pub: {uri: '127.0.0.1:50000'}
            }
            // '173.212.223.26:40000'
        ];
        for (let i = 0; i < knownPeers.length; i++) {
            let p = knownPeers[i];
            this.addPeer(new Peer({pubKey: p.pubKey, rep: p.rep, pub: p.pub}));
        }
    }

    isKnownPeer(peer) {
        if (!(peer instanceof Peer)) {
            throw new Error('Trying to check if non peer is known.');
        }
        let known = false;
        for (let i = 0; i < Object.keys(this.peers.list).length; i++) {
            let _peer = this.peers.list[Object.keys(this.peers.list)[i]];
            if (peer.pubKey == _peer.pubKey &&
                JSON.stringify(peer.pub) == JSON.stringify(_peer.pub) &&
                JSON.stringify(_peer.rep) == JSON.stringify(_peer.rep)) {
                known = true;
                break;
            }
        }
        return known;
    }

    /* Verify if a peer is a legit peer : 
     A peer should have a pubKey, is this a valid pubKey ?
     A peer should be pingable, is this the case ?
     */
    isValidPeer(peer) {
        return true;
    }

    addPeer(peer) {
        if (!(peer instanceof Peer)) {
            throw new Error('Trying to add non peer.');
        }

        console.log(`Adding new peer ${peer.pubKey} in the list (${peer.rep.host} | [${peer.rep.port},${peer.pub.port}]`);
        if (!this.isValidPeer(peer)) {
            return false;
        }

        this.peers.list.push(peer);
        //Because we found a new peer, we need to inform other node of that
        
        peer.connect();
        //We advertise ourself to the peer we've connected to.
        peer.sendIdentity({
            pubKey: this.config.pubKey,
            pub: this.config.pub,
            rep: this.config.rep
        })
    }
}
module.exports = Pool;