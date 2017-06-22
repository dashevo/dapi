/*
 * node.js - DAPI node class
 * 
 */
const Net = require('../net/net');
const Pool = require('../node/pool');
const {cl}=require('khal');

class Node {
    constructor(){
        cl('Started node');
        this.socks = {};
        this.start();
        let self = this;
        
        setTimeout(function () {
            self.pool = new Pool();
        },5000)//We set this with a delay to let time for our node to bound. Later we will remove that : FIXME.
    }
    start(){
        const net = new Net();
        //setup replier on the port 40000. 
        this.socks.rep = net.attach({type:'rep',uri:'127.0.0.1:40000'});
        //setup publisher on the port 50000.
        this.socks.pub = net.attach({type:'pub', uri:'127.0.0.1:50000'});
    }
    stop(){
        
    }
}
module.exports=Node;