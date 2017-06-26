const zmq = require('zmq');
function defaultOnMessage(msg) {
    console.log(`Requester - Received message`,msg);
}
class Requester {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://') == -1) ? `tcp://${params.uri}` : params.uri;
        this.onMessage = params.hasOwnProperty('onMessage') ? params.onMessage : defaultOnMessage.bind(this);
    }

    attach() {
        let self = this;
        let socket = this.socket = zmq.socket('req');
        let uri = this.uri;
        socket.on('connect', function (fileDescriptor, pairEndpoint) {
            console.log(`Requester - Connected to ${uri}.`);
        });
        socket.on('disconnect', function (fileDescriptor, pairEndpoint) {
            console.log(`Requester - Disconnected from ${uri}.`);
        });
        socket.on('message', function (msg) {
            if(Buffer.isBuffer(msg)) msg = msg.toString();
            try{ msg =  JSON.parse(msg)}catch (e){}
            self.onMessage(msg);
        });
        socket.monitor(500, 0);
        socket.connect(this.uri);

        console.log(`Requester - Trying to connect to ${this.uri}`);
        return this.socket;
    }

    detach() {
        if (this.socket) {
            this.socket.close();
        }
        return true;
    }
}
;
module.exports = Requester;