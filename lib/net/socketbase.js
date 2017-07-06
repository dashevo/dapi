const _ = require('lodash')
const zmq = require('zmq')
const Messages = require('../node/messages')

function defaultOnMessage(msg) {
    console.log(`PairResponder - Received message ${msg}`);
    this.socket.send(new Messages('ack').prepare());
}

class SocketBase {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://') == -1) ? `tcp://${params.uri}` : params.uri
        this.onMessage = params.hasOwnProperty('onMessage') ? params.onMessage : defaultOnMessage.bind(this)

    }

    attach() {
        let self = this
        let socket = self.socket = zmq.socket('pair')
        socket.on('listen', function(fileDescriptor, replierEndpoint) {
            console.log(`${self.constructor.name} - Listening for new connection:`)
        })
        socket.on('accept', function(fileDescriptor, replierEndpoint) {
            console.log(`${self.constructor.name} - Node (${fileDescriptor}) Connected`, replierEndpoint)
        })
        socket.on('disconnect', function(fileDescriptor, replierEndpoint) {
            console.log(`${self.constructor.name} - Node (${fileDescriptor}) disconnected from endpoint.`)
        });
        socket.on('message', function(msg) {
            if (Buffer.isBuffer(msg)) msg = msg.toString()
            try { msg = JSON.parse(msg) } catch (e) { }
            self.onMessage(msg)
        });
        socket.monitor(500, 0)
        console.log(`${self.constructor.name} bound to ${self.uri}`)

        return self.socket
    }

    detach() {
        if (this.socket) {
            this.socket.close()
        }
        return true
    }
}

module.exports = SocketBase