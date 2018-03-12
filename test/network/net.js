/* eslint-disable no-underscore-dangle */
// TODO: We don't control zeroMQ's API (that uses dangling underscores)
const assert = require('assert');
const Net = require('../../lib/services/net/net');
const { isPortTaken } = require('../../lib/utils/utils');

// TODO: Unit tests need to be written
describe('Network', () => {});


// TODO: Integration tests need to be migrated to another level
const PORTS = {
  pub: '10000',
  sub: '10000',
  rep: '10001',
  req: '10001',
  pReq: '10002',
  pRes: '10002',
};

xdescribe('Network - Net (0mq)', () => {
  const net = new Net();
  const socks = {};
  it('should be able to create a publisher', (done) => {
    this.timeout(2000);
    socks.pub = net.attach({ type: 'publisher', uri: `127.0.0.1:${PORTS.pub}` });
    setTimeout(() => {
      assert(socks.pub.socket.type === 'pub');
      // STATE : 0 = ready, 1=busy, 2=closed https://github.com/JustinTulloss/zeromq.node/blob/master/binding.cc#L66
      assert(socks.pub.socket._zmq.state === 0);
      isPortTaken(PORTS.pub)
        .then((res) => {
          assert(res === true);
          done();
        })
        .catch((e) => {
          done(e);
        });
    }, 1000);
  });
  it('should be able to create a subscriber', (done) => {
    socks.sub = net.attach({ type: 'subscriber', uri: `127.0.0.1:${PORTS.sub}` });
    this.timeout(2000);
    setTimeout(() => {
      assert(socks.sub.socket.type === 'sub');
      assert(socks.sub.socket._zmq.state === 0);
      isPortTaken(PORTS.sub)
        .then((res) => {
          assert(res === true);
          done();
        })
        .catch((e) => {
          done(e);
        });
    }, 1000);
  });
  it('should be able to create a replier', (done) => {
    socks.rep = net.attach({ type: 'replier', uri: `127.0.0.1:${PORTS.rep}` });
    this.timeout(2000);
    setTimeout(() => {
      assert(socks.rep.socket.type === 'rep');
      assert(socks.rep.socket._zmq.state === 0);
      isPortTaken(PORTS.rep)
        .then((res) => {
          assert(res === true);
          done();
        })
        .catch((e) => {
          done(e);
        });
    }, 1000);
  });
  it('should be able to create a requester', (done) => {
    socks.req = net.attach({ type: 'requester', uri: `127.0.0.1:${PORTS.req}` });
    this.timeout(2000);
    setTimeout(() => {
      assert(socks.req.socket.type === 'req');
      assert(socks.req.socket._zmq.state === 0);
      isPortTaken(PORTS.req)
        .then((res) => {
          assert(res === true);
          done();
        })
        .catch((e) => {
          done(e);
        });
    }, 1000);
  });
  it('should be able to create a pair requester', (done) => {
    socks.pReq = net.attach({ type: 'pairRequester', uri: `127.0.0.1:${PORTS.pReq}` });
    this.timeout(2000);
    setTimeout(() => {
      assert(socks.pReq.socket.type === 'pair');
      assert(socks.pReq.socket._zmq.state === 0);
      isPortTaken(PORTS.pReq)
        .then((res) => {
          assert(res === true);
          done();
        })
        .catch((e) => {
          done(e);
        });
    }, 1000);
  });
  it('should be able to create a pair responder', (done) => {
    socks.pRes = net.attach({ type: 'pairResponder', uri: `127.0.0.1:${PORTS.pRes}` });
    this.timeout(2000);
    setTimeout(() => {
      assert(socks.pRes.socket.type === 'pair');
      assert(socks.pRes.socket._zmq.state === 0);
      isPortTaken(PORTS.pRes)
        .then((res) => {
          assert(res === true);
          done();
        })
        .catch((e) => {
          done(e);
        });
    }, 1000);
  });
  it('should be able to destroy each previously started attached elements', () => {
    Object.keys(socks).forEach((type) => {
      const el = socks[type];
      assert(el.detach() === true);
      assert(el.socket._zmq.state === 2);
    });
  });
  it('should free the port associated', (done) => {
    const promises = [];
    promises.push(isPortTaken(PORTS.sub));
    promises.push(isPortTaken(PORTS.rep));

    Promise
      .all(promises)
      .then((res) => {
        res.forEach((_r) => {
          _r.should.equal(false);
        });
        done();
      })
      .catch((e) => {
        console.error(e);
        done(e);
      });
  });
});
