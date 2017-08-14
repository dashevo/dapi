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
            console.log("synced, db: " + dbname)
            console.log("last node: " + this.dapilist.iterator({ limit: 1 }).collect())
            const nodelist = this.dapilist.iterator({ limit: -1 }).collect();
            nodelist.forEach((node) => console.log(node.ip + ' ' + node.pubkey + '\n'));
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

    contains(ip) {
        const all = this.dapilist.iterator({ limit: -1 })
            .collect()
            .map((e) => e.payload.value)
        // [{ name: 'User1' }]
        return this.kvs.get(key) !== 'undefined'
    }

}

module.exports = dapiList
