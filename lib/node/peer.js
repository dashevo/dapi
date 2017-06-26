/*
 * peer.js - DAPI Peer Class
 * Manage a single peer
 */
const Messages = require('./messages');
const Net = require('../net/net');
const emitter = require('./eventBus');
class Peer {
    constructor(data) {
        if (!data) {
            throw new Error('Impossible to create such a peer without any data.');
        }
        if(!data.hasOwnProperty('pubKey'))  throw new Error('Peer\'s pubKey missing');
        if(!data.hasOwnProperty('rep') || !data.rep.hasOwnProperty('uri')) throw new Error('REP.URI missing');
        if(!data.hasOwnProperty('pub') || !data.pub.hasOwnProperty('uri')) throw new Error('PUB.URI missing');
        this.socket = null;
        this.args = data;

        this.id = -1;
        this.pingInterval = 5*1000;
        this.pubKey = this.args.pubKey;
        this.rep = {
            host: this.args.rep.uri.split(':')[0],
            port:this.args.rep.uri.split(':')[1]||'40000'
        };
        this.rep.uri = this.rep.host+':'+this.rep.port;

        this.pub = {
            host: this.args.pub.uri.split(':')[0],
            port:this.args.pub.uri.split(':')[1]||'50000'
        };
        this.pub.uri = this.pub.host+':'+this.pub.port;

        this.lastPing = -1;
        this.knownSince = -1;//POSIX timestamp
        this.lastSeen = -1;//Timestamp

        this.inbound = false; //Is the peer an inbound of us ? 
        this.outbound = false; //Is the peer an outbound of us ? 
        this.connected = false;
        let self = this;
        this.pingTimer = setInterval(function () {
            self.sendPing();
        }, this.pingInterval)
    }

    sendPing() {
        let self = this;
        if(this.socket){
            let ping = new Messages('ping');
            ping.addCorrelationId();
            let refTs = +new Date();
            emitter.once(ping.data.correlationId,function () {
                self.lastPing=(+new Date())-refTs;
                self.lastSeen=+new Date();
            });
            this.socket.socket.send(ping.prepare());
        }
    }
    sendIdentity(data){
        if(this.socket){
            let identity = new Messages('identity');
            identity.addData(data);
            console.log("Sending our ID to",this.rep.uri);
            this.socket.socket.send(identity.prepare());//FIXME : Ugly. 
        }
    }
    connect() {
        let self = this;
        if(this.connected===true || this.socket!==null){
            this.connected=true;
            throw new Error('Peer connection already established !');
        }
        const net = new Net();
        //The requester pairing serves to announce our status : a way for us to identify.
        let socket = net.attach({
            type:'req',
            uri:`${this.rep.host}:${this.rep.port}`,
            onMessage:onRequesterMessage.bind(this)
        });
        this.outbound = true;
        this.connected = true;
        this.socket = socket;
        return socket;
    }
    disconnect(){
        if(this.socket && this.connected){
            this.socket.detach();
            this.outbound=false;
            this.connected=false;
            console.log(`Disconnected from ${this.pubKey}`);
        }
    }
}

function onRequesterMessage(msg) {
    let self = this;
    if(msg && msg.type){
        switch (msg.type){
            case "pong":
                emitter.emit(msg.correlationId);
                break;
        }
    }
}
module.exports = Peer;