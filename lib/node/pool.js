/*
 * pool.js - DAPI Pool Class
 * Manage the pool of peers
 */
const Peer = require('./peer');
class Pool {
    constructor() {
        this.peers = {
            list: [],
            inbound: [],
            outbound: []
        }
        this.addKnownPeers();
    }

    addKnownPeers() {
        const knownPeers = [
            '127.0.0.1:40000',
            // '173.212.223.26:40000'
        ];
        for (let i = 0; i < knownPeers.length; i++) {
            this.addPeer(new Peer({uri: knownPeers[i]}));
        }
    }

    addPeer(peer) {
        if (!(peer instanceof Peer)) {
            throw new Error('Trying to add non peer.');
        }
        console.log('Adding new peer in the list', peer.address);
        this.peers.list.push(peer);
        peer.connect();
    }
}
module.exports = Pool;