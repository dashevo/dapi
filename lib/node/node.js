/*
 * node.js - DAPI node class
 * 
 */
const Net = require('../net/net');
const Pool = require('../node/pool');
const Peer = require('../node/peer');
const kvs = require('../mempool/keyValueStore');
const nodefeed = require('../mempool/dapiList'); //this keeps track of all enabled dapi nodes to filter MN list during development (EV-402)
const { cl } = require('khal');
const _ = require('lodash');
const Messages = require('../node/messages');
const emitter = require('./eventBus');
const ifaces = require('os').networkInterfaces();

class Node {
    constructor(params) {
        this.config = {
            pubKey: _.get(params, 'pubKey') || 'InvalidPubKey',
            privKey: _.get(params, 'privKey') || 'InvalidPrivKey',
            rep: {
                uri: '127.0.0.1:' + (_.get(params, 'rep.port') || '40000')
            },
            pub: {
                uri: '127.0.0.1:' + (_.get(params, 'pub.port') || '50000')
            }
        };
        cl('Config :', this.config);

        this.ip;
        let self = this;
        getIP(function (ip) {
            self.ip = ip;
        });
        cl('node ip :', this.ip);
        this.version =  _.get(params, 'version');
        this.insight =  _.get(params, 'insight');
        this.socks = {};
        this.mempool = new kvs(_.get(params, 'mempoolPort'));
        this.dapilist = new nodefeed(_.get(params, 'dapiListPort'));
        this.nodeListHeartBeatTimeout = -1; // if positiv: milliseconds until polling dapilist stops; default -1 = no timeout
        this.nodeListHeartBeatInterval = _.get(params, 'nlhbInterval')*1000; // interval in milliseconds; 15 min. = 900000 | set to a few seconds for testing
        this.nodeListTimeStampTimeout = _.get(params, 'nltsTimeout')*1000; // interval in milliseconds; 30 min. = 1800001 (should be > 2x nodeListHeartBeatInterval to make sure we don't delete a connected node that just didn't refresh in between)
        this.init();
        setTimeout(function() {
            self.start();
        }, 1000)//We set this with a delay to let time for our node to bound. Later we will remove that : FIXME.
    }

    init() {
        cl('Initializing...');
        const net = new Net();
        //setup replier on the port 40000. 
        //Replier uses are : 
        // - Allow for a new node to inform us that they exist.
        this.socks.rep = net.attach({
            type: 'rep',
            uri: this.config.rep.uri,
            onMessage: onReplierMessage.bind(this)
        });

        //setup publisher on the port 50000.
        //Publisher uses are : 
        // - Inform all subscriber that a new data has came into our knowledge
        this.socks.pub = net.attach({
            type: 'pub',
            uri: this.config.pub.uri,
            onMessage: onPublisherMessage.bind(this)
        });
    }

    start() {
        let self = this;
        this.pool = new Pool(this.config);
        this.announceNewPeer();
        this.addNodeToDapiList();
        cl(`Started node \n`);
        setTimeout(function() {
            pollFunc(sendHeartBeat.bind(self), self.nodeListHeartBeatTimeout, self.nodeListHeartBeatInterval);
        }, 1000)//We set this with a delay to give orbitDB some time to pin the node : FIXME.
    }

    announceNewPeer() {
        let self = this;
        emitter.on('peer.announceNew', function(peer) {
            if (peer.hasOwnProperty("pubKey") && peer.hasOwnProperty('rep') && peer.hasOwnProperty('pub')) {
                let newPeerMsg = new Messages('newPeer');
                newPeerMsg.addData({ peer: peer });
                console.log('SEND PUB', newPeerMsg.prepare());
                self.socks.pub.socket.send(newPeerMsg.prepare());
            }
        })

    }

    addNodeToDapiList() {
        let node = { payee: this.config.pubKey, ts: new Date().getTime(), ip: this.ip, version: this.version, insight: this.insight};
        this.dapilist.addNode(this.config.pubKey, node);
    }

    addMemPoolData(mnPrivKey, mnPubAdr, value, key) {
        if (this.isUniqueKey(key)) {
            this.mempool.writeValue(mnPrivKey, mnPubAdr, value, key);
        }
    }

    getMemPoolData(key) {
        return this.mempool.getValue(key);
    }

    isUniqueKey(key) {
        return !this.mempool.getValue(key);
    }

    removeNodeFromDapiList(pubkey) {
        let nl = this.dapilist;
        nl.removeNode(pubkey);
    }
}

function onPublisherMessage(msg) {
    let self = this;
    console.log('----- PUBLISHER received :');
    console.log(msg);
    console.log('----- /pub:');
}

function onReplierMessage(msg) {
    let self = this;
    if (msg && msg.hasOwnProperty('type')) {
        switch (msg.type) {
            case "ping":
                let pong = new Messages('pong');
                pong.addData({ correlationId: msg.correlationId });
                this.socks.rep.socket.send(pong.prepare());
                break;
            case "peerList":
                let cleanedList = self.pool.getList();
                let peerList = new Messages('peerList');
                peerList.addData({ list: cleanedList });
                self.socks.rep.socket.send(peerList.prepare());
                break;
            case "identity":
                if (msg.hasOwnProperty('pubKey') && msg.hasOwnProperty('rep') && msg.hasOwnProperty('pub')) {
                    let peer = new Peer({
                        pubKey: msg.pubKey,
                        pub: msg.pub,
                        rep: msg.rep
                    });
                    if (!self.pool.isKnownPeer(peer)) self.pool.addPeer(peer);
                }
                this.socks.rep.socket.send(new Messages('ack').prepare());
                break;
            default:
                this.socks.rep.socket.send(new Messages('ack').prepare());
                break;
        }
    }
}


// 1. remove and add this node with new timestamp every 15 min.
// 2. clean list by removing nodes that have timestamp > 30 min.
function sendHeartBeat() {
    let nl = this.dapilist;
    let list = nl.getList();
    if (list) {
        // remove own node
        let self = this;
        console.log('pubkey: ' + this.config.pubKey);
        console.log('old list: ' + JSON.stringify(list));
        nl.updateNodeTimestamp(this.config.pubKey);
        console.log('new list: ' + JSON.stringify(list));
        // loop through array and remove every outdated node
        let i = 0
        list.forEach(function(){
            if (list[i].payee !== self.config.pubKey){
                console.log('ts: ' + list[i].ts);
                if (((new Date).getTime() -  list[i].ts ) >= self.nodeListTimeStampTimeout) {
                    cl('node timed out! Remove from dapilist');
                    // log info about the dapi node to be removed
                    console.log("ts: " + list[i].ts);
                    console.log("pubkey = [" + list[i].payee + "]")
                    // remove this node because its timestamp hasn't been updated for too long and probably suffered a power outage
                    self.removeNodeFromDapiList(list[i].payee);
                } else {
                    cl('node still within timeout limit');
                }
                i = i + 1;
            }
        });
        return false;
    } else {
        return true; // set to true if interval function should be only executed once.
    }
}

function pollFunc(fn, timeout, interval) {
    let canPoll;
    var startTime = (new Date()).getTime();
    interval = interval || 900000, // default 15 min.
        canPoll = true;

    (function p() {
        if (timeout = -1) {
            canPoll = true;
        } else {
            canPoll = ((new Date).getTime() - startTime ) <= timeout;
        }
        if (!fn() && canPoll)  { // ensures the function exucutes
            setTimeout(p, interval);
        }
    })();
}

function getIP (cb) {
    let self = this;
    let address;
    Object.keys(ifaces).forEach(dev => {
        ifaces[dev].filter(details => {
            if (details.family === 'IPv4' && details.internal === false) {
                address = details.address;
                cb (address);
            }
        });
    });
}

module.exports = Node;