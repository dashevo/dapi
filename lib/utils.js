function isPortTaken(port, ipv6 = false) {
    const net = require('net');
    return new Promise(function (resolve, reject) {
        let uri = ipv6 ? '::' : '127.0.0.1';
        let i = 0;
        let servlet = net.createServer();
        servlet.on('error', function (err) {
            if (err.code !== 'EADDRINUSE') return reject(err)
            return resolve(true);
        });
        servlet.on('listening', function () {
            return resolve(false);
        });
        servlet.on('close', function () {
            return resolve(false);
        })
        servlet.listen(port, uri);
    });
}

const Utils = {
    isPortTaken:isPortTaken    
};
module.exports = Utils;