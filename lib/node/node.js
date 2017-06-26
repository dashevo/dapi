/*
 * node.js - DAPI node class
 * 
 */
const Net = require('../net/net');
const Pool = require('../node/pool');
const Peer = require('../node/peer');
const {cl}=require('khal');
const _ = require('lodash');
const Messages = require('../node/messages');


class Node {
    constructor(params){
        cl('Initializing...');
        
        this.config = {
            pubKey:_.get(params,'pubKey')||'InvalidPubKey',
            rep:{
                uri:'127.0.0.1:'+_.get(params,'rep.port') || '40000'
            },
            pub:{
                uri:'127.0.0.1:'+_.get(params,'pub.port') || '50000'
            }
        };
        cl('Config :',this.config);
        
        this.socks = {};
        this.start();
        let self = this;
        
        setTimeout(function () {
            self.pool = new Pool(self.config);
        },1000)//We set this with a delay to let time for our node to bound. Later we will remove that : FIXME.
    }
    start(){
        cl(`Started node \n`);
        
        const net = new Net();
        //setup replier on the port 40000. 
        //Replier uses are : 
        // - Allow for a new node to inform us that they exist.
        this.socks.rep = net.attach({
            type:'rep',
            uri:this.config.rep.uri,
            onMessage:onReplierMessage.bind(this)
        });
        
        //setup publisher on the port 50000.
        //Publisher uses are : 
        // - Inform all subscriber that a new data has came into our knowledge
        this.socks.pub = net.attach({
            type:'pub', 
            uri:this.config.pub.uri
        });
    }
    stop(){
        
    }
}

function onReplierMessage(msg) {
    let self = this;
    if(msg && msg.hasOwnProperty('type')){
        switch(msg.type){
            case "ping":
                let pong = new Messages('pong');
                pong.addData({correlationId:msg.correlationId});
                this.socks.rep.socket.send(pong.prepare());
                break;
            case "identity":
                if(msg.hasOwnProperty('pubKey') && msg.hasOwnProperty('rep') && msg.hasOwnProperty('pub')){
                    let peer = new Peer({
                        pubKey:msg.pubKey,
                        pub:msg.pub,
                        rep:msg.rep
                    })
                    if(!self.pool.isKnownPeer(peer)) self.pool.addPeer(peer);
                }
                this.socks.rep.socket.send(new Messages('ack').prepare());
                break;
            default:
                this.socks.rep.socket.send(new Messages('ack').prepare());
                break;
        }
    }
}
module.exports=Node;