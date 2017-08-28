var PrivateKey = require('bitcore-lib-dash').PrivateKey;
var Message = require('bitcore-message-dash');
var mocks = require('../mocks/mocks')

class dapiList extends require('./mempoolBase') {
    constructor(port, namespace = 'dapilist') {
        super(port)
        this.dapilist = this.orbitdb.feed(namespace);
        this.init();
    }

    init() {

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
        this.dapilist.add(node)
            .then((hash) => {
                cb(null, hash);
            });
    }

    removeNode(hash, cb) {
        this.dapilist.remove(hash)
            .then((removed) => {
                cb(null, removed);
            });
    }

    getList() {
        const nodelist = this.dapilist.iterator({ limit: -1 }).collect();
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

    contains(ip) {
        const all = this.dapilist.iterator({ limit: -1 })
            .collect()
            .map((e) => e.payload.value)
        // [{ name: 'User1' }]
        return this.kvs.get(key) !== 'undefined'
    }

}

module.exports = dapiList
