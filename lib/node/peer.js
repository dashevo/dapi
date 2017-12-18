/*
 * peer.js - DAPI Peer Class
 * Manage a single peer
 */
const Messages = require('./messages');
const Net = require('../net/net');
const emitter = require('./eventBus');

class Peer {
  constructor(data) {
    // pvr: suggest to move this error checking to the entry point (ie api call) of an end to end flow
    if (!data) {
      throw new Error('Impossible to create such a peer without any data.');
    }
    if (!data.hasOwnProperty('pubKey')) throw new Error('Peer\'s pubKey missing');
    if (data.rep.hasOwnProperty('port') && data.rep.hasOwnProperty('host')) { data.rep.uri = `${data.rep.host}:${data.rep.port}`; }
    if (data.pub.hasOwnProperty('port') && data.pub.hasOwnProperty('host')) { data.pub.uri = `${data.pub.host}:${data.pub.port}`; }
    if (!data.hasOwnProperty('rep') || !data.rep.hasOwnProperty('uri')) throw new Error('REP.URI missing');
    if (!data.hasOwnProperty('pub') || !data.pub.hasOwnProperty('uri')) throw new Error('PUB.URI missing');
    this.args = data;

    this.id = -1;
    this.pingInterval = 5 * 1000;
    this.pubKey = this.args.pubKey;
    this.rep = {
      host: this.args.rep.uri.split(':')[0],
      port: this.args.rep.uri.split(':')[1] || '40000',
      connected: false,
      socket: null,
    };
    this.rep.uri = `${this.rep.host}:${this.rep.port}`;

    this.pub = {
      host: this.args.pub.uri.split(':')[0],
      port: this.args.pub.uri.split(':')[1] || '50000',
      connected: false,
      socket: null,
    };
    this.pub.uri = `${this.pub.host}:${this.pub.port}`;

    this.lastPing = -1;
    this.knownSince = -1;// POSIX timestamp
    this.lastSeen = -1;// Timestamp

    this.inbound = false; // Is the peer an inbound of us ?
    this.outbound = false; // Is the peer an outbound of us ?
    const self = this;
    this.pingTimer = setInterval(() => {
      self.sendPing();
    }, this.pingInterval);
  }

  sendPing() {
    const self = this;
    if (this.rep.socket) {
      const ping = new Messages('ping');
      ping.addCorrelationId();
      const refTs = +new Date();
      emitter.once(ping.data.correlationId, () => {
        self.lastPing = (+new Date()) - refTs;
        self.lastSeen = +new Date();
      });
      this.rep.socket.socket.send(ping.prepare());
    }
  }
  sendIdentity(data) {
    if (this.rep.socket) {
      const identity = new Messages('identity');
      identity.addData(data);
      console.log('Sending our ID to', this.rep.uri);
      this.rep.socket.socket.send(identity.prepare());// FIXME : Ugly.
    }
  }
  askPeerList() {
    if (this.rep.socket) {
      const peerList = new Messages('peerList');
      peerList.addCorrelationId();
      console.log(`Asking peerList to ${this.rep.uri}`);
      this.rep.socket.socket.send(peerList.prepare());
    }
  }
  connect() {
    const self = this;
    if (this.rep.connected === true || this.rep.socket !== null) {
      this.rep.connected = true;
      throw new Error('Peer connection already established !');
    }
    const net = new Net();
    // The requester pairing serves to announce our status : a way for us to identify.
    const repSocket = net.attach({
      type: 'req',
      uri: `${this.rep.host}:${this.rep.port}`,
      onMessage: onRequesterMessage.bind(this),
    });
    this.outbound = true;
    this.rep.connected = true;
    this.rep.socket = repSocket;

    // The requester pairing serves to announce our status : a way for us to identify.
    const pubSocket = net.attach({
      type: 'sub',
      uri: `${this.pub.host}:${this.pub.port}`,
      onMessage: onSubscriberMessage.bind(this),
    });
    this.pub.connected = true;
    this.pub.socket = pubSocket;
    return true;
  }
  disconnect() {
    if (this.rep.socket && this.rep.connected) {
      this.rep.socket.detach();
      this.outbound = false;
      this.rep.connected = false;
      console.log(`Disconnected from replier ${this.pubKey}`);
    }
    if (this.pub.socket && this.pub.connected) {
      this.pub.socket.detach();
      this.pub.connected = false;
      console.log(`Disconnected from publisher ${this.pubKey}`);
    }
  }
}

function onRequesterMessage(msg) {
  const self = this;
  if (msg && msg.type) {
    switch (msg.type) {
      case 'peerList':
        console.log(msg);
        if (msg.hasOwnProperty('list')) {
          const list = msg.list;
          emitter.emit('peerList.received', list);
        }
        break;
      case 'pong':
        emitter.emit(msg.correlationId);
        break;
    }
  }
} function onSubscriberMessage(msg) {
  const self = this;
  if (msg && msg.type) {
    switch (msg.type) {
      case 'newPeer':
        emitter.emit('peer.receivedNew', msg.peer);
        break;
    }
  }
}
module.exports = Peer;
