const zmq = require('zmq');
function defaultOnMessage(msg) {
    console.log(`PairRequester - Received message`, msg)
}

//pvr: suggestion to move common code among all net classes to a base class to be inherited with "extend"

class PairRequester {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://') == -1) ? `tcp://${params.uri}` : params.uri
        this.onMessage = params.hasOwnProperty('onMessage') ? params.onMessage : defaultOnMessage.bind(this)
    }

    attach() {
        let self = this;
        let socket = this.socket = zmq.socket('pair')
        let uri = this.uri
        socket.on('connect', function(fileDescriptor, pairEndpoint) {
            console.log(`PairRequester - Connected to ${uri}.`)
        });
        socket.on('disconnect', function(fileDescriptor, pairEndpoint) {
            console.log(`PairRequester - Disconnected from ${uri}.`)
        });

        socket.on('message', function(msg) {
            if (Buffer.isBuffer(msg)) msg = msg.toString()
            try { msg = JSON.parse(msg) } catch (e) { }
            self.onMessage(msg)
        });
        socket.monitor(500, 0);
        socket.connect(this.uri)

        console.log(`PairRequester - Trying to connect to ${this.uri}`)
        return this.socket
    }

    detach() {
        if (this.socket) {
            this.socket.close()
        }
        return true;
    }
}

module.exports = PairRequester