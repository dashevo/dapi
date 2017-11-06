var PrivateKey = require('bitcore-lib-dash').PrivateKey;
var Message = require('bitcore-message-dash');
var mocks = require('../mocks/mocks')

class dapiList extends require('./mempoolBase') {
    constructor(port, namespace = 'dapilist') {
        super(port)
        this.dapilist = this.orbitdb.kvstore(namespace);
        this.init();
    }

    init(key = 'nodelist') {

        this.dapilist.events.on('ready', () => {
            console.log("ready: " + this.dapilist.get(key))
        })

        this.dapilist.events.on('synced', () => {
            console.log("synced: " + this.dapilist.get(key))
        })

        this.dapilist.events.on('write', (dbname, hash, entry) => {
            let obj = entry.payload.value;
            this.dapilist._ipfs.pin.add(hash);
            console.log("written and pinned dapilist with new entry: " + JSON.stringify(obj))
            console.log("dapilist: " + this.dapilist.get(key))
        })

    }

    // probably not needed
    isMasternode(pubAdr) {
        return mocks.mnList.find(mn => mn.publicAdr == pubAdr);
    }

    addNode(node) {
        let nodearray = [];
        let nodelist = this.getList(); //TODO: here we load and append node if not already in nodelist
        if(nodelist){
            const strlist = JSON.stringify(nodelist);
            if(strlist.indexOf(node) === -1) {
                nodelist.push(node);
            }
            else{
                console.log('node already added to dapilist');
            }
        }
        else {
            nodearray.push(node);
            console.log('pushed node to dapilist');
            this.writeValue(nodearray);
        }
    }

    removeNode(pubkey) {
        const nodelist = this.getValue();
        //find node element in array and remove...
        const node = nodelist.find(o => o.payee === pubkey);
        const index = nodelist.indexOf(node);
        if (index > -1) {
            nodelist.splice(index, 1);
        }
    }

    getList() {
        const nodelist = this.getValue();
        if (nodelist) {
            return nodelist;
        }
        else {
            return false;
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

        this.dapilist.set(key, value)
            .then(() => {
                console.log(this.dapilist.get(key))
            })
    }

    getValue(key = 'nodelist') {
        var d = this.dapilist.get(key);

        if (d) {
            return d;
        }
        else {
            return false;
        }
    }

    contains(key) {
        return this.dapilist.get(key) !== 'undefined'
    }

}

module.exports = dapiList
