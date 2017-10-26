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

        this.dapilist.events.on('ready', (dbname) => {
            console.log("ready event, db: " + dbname)
        })

        this.dapilist.events.on('synced', (dbname) => {
            //FIXME: only used for dev debugging. Later on just log newly synced entry with logger
            console.log("synced, db: " + dbname)
            console.log("last node:")
            const lastnode = this.dapilist.iterator({ limit: 1 }).collect();
            lastnode.forEach((node) => console.log(node.payload.value.ip + ' ' + node.payload.value.payee));
            console.log("all nodes:")
            const nodelist = this.dapilist.iterator({ limit: -1 }).collect();
            nodelist.forEach((node) => console.log(node.payload.value.ip + ' ' + node.payload.value.payee));
        })

    }

    // probably not needed
    isMasternode(pubAdr) {
        return mocks.mnList.find(mn => mn.publicAdr == pubAdr);
    }

    addNode(node, cb) {
        const nodelist = node; //TODO: here we load and append node if not already in nodelist
        this.writeValue(nodelist);
    }

    removeNode(pubkey) {
        const nodelist = this.dapilist.getList();
        //TODO: here we remove node object form dapilist json array
        console.log('removed');
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

        this.kvs.set(key, value)
            .then(() => {
                console.log(this.kvs.get(key))
            })
    }

    getValue(key = 'nodelist') {
        var d = this.kvs.get(key);

        if (d) {
            return d;
        }
        else {
            return false;
        }
    }

    contains(key) {
        return this.kvs.get(key) !== 'undefined'
    }

}

module.exports = dapiList
