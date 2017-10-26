const nodeCache = require('node-cache')
const myCache = new nodeCache();

module.exports = {
    set: function(key, value) {
        myCache.set(key, value, ttl)
    },
    get: function(key) {
        return new Promise(function(resolve, reject) {
            myCache.get(key, function(err, res) {
                if (!err) {
                    resolve(res)
                }
                else {
                    reject(`Cache fetch error: ${err}`)
                }
            })
        })
    }

}

var cache = [];
const ttl = 60 * 60 * 600; //1 hour