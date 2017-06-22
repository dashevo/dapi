/*
 * peer.js - DAPI Peer Class
 * Manage a single peer
 */
const Net = require('../net/net');
class Peer {
    constructor(data) {
        if (!data) {
            throw new Error('Impossible to create such a peer without any data.');
        }
        this.socket = null;
        this.args = data;

        this.id = -1;
        this.lastPing = -1;
        this.pingInterval = 5000;
        this.address = {
            host: this.args.uri.split(':')[0],
            port:'40000'
            // port:this.args.uri.split(':')[1]
        };

        this.knownSince = -1;//POSIX timestamp
        this.lastSeen = -1;//Timestamp

        this.inbound = false; //Is the peer an inbound of us ? 
        this.outbound = false; //Is the peer an outbound of us ? 
        this.connected = false;
        let self = this;
        // this.pingTimer = setInterval(function () {
        //     self.sendPing();
        // }, this.pingInterval)
    }

    sendPing() {
        let msg = {
            type: 'ping'
        }
    }

    connect() {
        if(this.connected==true || this.socket!==null){
            this.connected=true;
            throw new Error('Peer connection already established !');
        }
        const net = new Net();
        let socket = net.attach({type:'req',uri:`${this.address.host}:40000`});
        this.outbound = true;
        this.connected = true;
        this.socket = socket;
        
        return socket;
    }
}
module.exports = Peer;