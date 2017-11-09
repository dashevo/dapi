var PrivateKey = require('bitcore-lib-dash').PrivateKey;
var Message = require('bitcore-message-dash');
var mocks = require('../mocks/mocks')

class dapiList extends require('./mempoolBase') {
    constructor(port, namespace = 'dapilist') {
        super(port)
        this.ready = false;
        this.dapilist = this.orbitdb.kvstore(namespace);
        this.dapilist.load();
        this.init();
    }

    init(key = 'nodelist') {
        this.dapilist.events.on('ready', () => {
            this.ready = true;
            console.log("ready: " + JSON.stringify(this.dapilist.get(key)));
        })

        this.dapilist.events.on('synced', () => {
            this.ready = true;
            console.log("synced: " + JSON.stringify(this.dapilist.get(key)));
        })

        this.dapilist.events.on('write', (dbname, hash, entry) => {
            let obj = entry.payload.value;
            //this.dapilist._ipfs.pin.add(hash);
            console.log("written dapilist with new entry: " + JSON.stringify(obj));
            console.log("dapilist: " + JSON.stringify(this.dapilist.get(key)));
        })

    }

    // probably not needed
    isMasternode(pubAdr) {
        return mocks.mnList.find(mn => mn.publicAdr == pubAdr);
    }

    addNode(pubkey, node) {
        let nodelist = this.getList();
        console.log('addNode nodelist1: ' + JSON.stringify(nodelist));
        if(nodelist.length > 0){
            //check if node element already present, and if not, then add it
            const existing = nodelist.find(o => o.payee === pubkey);
            if (existing) {
                console.log('noop: node already in dapilist');
            } else{
                nodelist.push(node);
                console.log('pushed new node to dapilist');
                this.writeValue(nodelist);
                console.log('nodelist3: ' + JSON.stringify(nodelist));
            }
        }else{ //first node goes here
            nodelist.push(node);
            console.log('pushed first node to dapilist');
            this.writeValue(nodelist);
            console.log('nodelist2: ' + JSON.stringify(nodelist));
        }
    }

    removeNode(pubkey) {
        const nodelist = this.getValue();
        //find node element in array and remove...
        const node = nodelist.find(o => o.payee === pubkey);
        const index = nodelist.indexOf(node);
        if (index > -1) {
            nodelist.splice(index, 1);
            this.writeValue(nodelist);
        }
    }

    updateNodeTimestamp(pubkey) {
        const nodelist = this.getValue();
        let node = nodelist.find(o => o.payee === pubkey);
        if (node){
            node.ts = new Date().getTime();
            console.log('node ts: ' + JSON.stringify(node));
            console.log('nodelist ts: ' + JSON.stringify(nodelist));
            this.writeValue(nodelist);
            return true
        }else{
            return false
        }
    }

    getList() {
        const nodelist = this.getValue();
        if (nodelist){
            return nodelist;
        }else{
            const arr = [];
            return arr;
        }
    }

    getFilteredList(unfilteredList) {
        let filteredSet = new Set();
        let nodelist = this.dapilist.iterator({ limit: -1 }).collect();
        if (unfilteredList) {
            if (nodelist) {
                for (let i = 0; i < unfilteredList.length; i++) {
                    const mnode = unfilteredList[i];
                    for (var node of nodelist) {
                        if (mnode.payee === node.payload.value.payee) {
                            filteredSet.add(mnode);
                            console.log('added node no: ' + i);
                            console.log('payee: ' + mnode.payee);
                            console.log('ip: ' + mnode.ip);
                            mnode.dapi = node.payload.value.version;
                            mnode.insight = node.payload.value.insight;
                        } else {
                            console.log('removed node no: ' + i);
                            console.log('payee: ' + mnode.payee);
                            console.log('ip: ' + mnode.ip);
                        }
                    }
                }
                const filtered = Array.from(filteredSet);
                return filtered;
            } else {
                return unfilteredList;
            }
        }
        else {
            return false;
        }
    }

    writeValue(value, key = 'nodelist') {

        if (value.length > 0){
            this.dapilist.set(key, value)
                .then(() => {
                    console.log('Inserted: ' + JSON.stringify(this.dapilist.get(key)))
                })
        }else{
            console.log('STUPID NODE! Tried to write an empty value.');
        }
    }

    getValue(key = 'nodelist') {
        var d = this.dapilist.get(key);
        console.log('d: ' + d);
        if (d) {
            return d;
        }
        else {
            const arr = [];
            return arr;
        }
    }

    contains(key) {
        return this.dapilist.get(key) !== 'undefined'
    }

}

module.exports = dapiList
