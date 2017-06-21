'use strict'
const should = require('should');
const net = require('net');
const portfinder = require('portfinder');
const assert = require('assert');
const Net = require('../../lib/net/net');
const PORTS = {
    'pub': '10000',
    'sub': '10000',
    'rep': '10001',
    'req': '10001'
}
function isPortTaken(port, ipv6 = false) {
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
describe('Network - Net (0mq)', function () {
    let net = new Net()
    let socks = {};
    it('should be able to create a publisher', function (done) {
        this.timeout(2000);
        socks.pub = net.attach({type: "publisher", uri: `127.0.0.1:${PORTS['pub']}`});
        setTimeout(function () {
            assert(socks.pub.socket.type == "pub")
            assert(socks.pub.socket._zmq.state == 0)//STATE : 0 = ready, 1=busy, 2=closed https://github.com/JustinTulloss/zeromq.node/blob/master/binding.cc#L66
            isPortTaken(PORTS['pub'])
                .then(function (res) {
                    assert(res == true);
                    done();
                })
                .catch(function (e) {
                    done(e);
                });
        }, 1000);
    });
    it('should be able to create a subscriber', function (done) {
        socks.sub = net.attach({type: "subscriber", uri: `127.0.0.1:${PORTS['sub']}`});
        this.timeout(2000);
        setTimeout(function () {
            assert(socks.sub.socket.type == "sub")
            assert(socks.sub.socket._zmq.state == 0)
            isPortTaken(PORTS['sub'])
                .then(function (res) {
                    assert(res == true);
                    done();
                })
                .catch(function (e) {
                    done(e);
                });
        }, 1000);
    });
    it('should be able to create a replier', function (done) {
        socks.rep = net.attach({type: "replier", uri: `127.0.0.1:${PORTS['rep']}`});
        this.timeout(2000);
        setTimeout(function () {
            assert(socks.rep.socket.type == "rep")
            assert(socks.rep.socket._zmq.state == 0)
            isPortTaken(PORTS['rep'])
                .then(function (res) {
                    assert(res == true);
                    done();
                })
                .catch(function (e) {
                    done(e);
                });
        }, 1000);

    });
    it('should be able to create a requester', function (done) {
        socks.req = net.attach({type: "requester", uri: `127.0.0.1:${PORTS['req']}`});
        this.timeout(2000);
        setTimeout(function () {
            assert(socks.req.socket.type == "req")
            assert(socks.req.socket._zmq.state == 0)
            isPortTaken(PORTS['req'])
                .then(function (res) {
                    assert(res == true);
                    done();
                })
                .catch(function (e) {
                    done(e);
                });
        }, 1000);
    });
    it('should be able to destroy each previously started attached elements', function () {
        for (let type in socks) {
            let el = socks[type];
            assert(el.detach() == true)
            assert(el.socket._zmq.state == 2);
        }
    })
    it('should free the port associated', function (done) {
        let promises = [];
        promises.push(isPortTaken(PORTS['sub']));
        promises.push(isPortTaken(PORTS['rep']));

        Promise
            .all(promises)
            .then(function (res) {
                res.forEach(function (_r) {
                    _r.should.equal(false);
                })
                done();
            })
            .catch(function (e) {
                console.error(e);
                done(e);
            })
    })
})
;
