const zmq = require('zmq');
function defaultOnMessage(msg) {
    console.log(`Publisher - Received message`,msg);
}
class Publisher {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://') == -1) ? `tcp://${params.uri}` : params.uri;
        this.onMessage = params.hasOwnProperty('onMessage') ? params.onMessage : defaultOnMessage.bind(this);
    }

    attach() {
        let socket = this.socket = zmq.socket('pub');
        socket.on('connect', function (fileDescriptor, ep) {
            console.log('Publisher - connect, endpoint:', ep, fileDescriptor);
        });
        socket.on('listen', function (fileDescriptor, ep) {
            console.log('Publisher - listen, endpoint:', ep, fileDescriptor);
        });
        socket.on('accept', function (fileDescriptor, ep) {
            console.log('Publisher - accepting entering connexion., endpoint:', ep, fileDescriptor);
        });
        socket.on('disconnect', function (fileDescriptor, ep) {
            console.log('Publisher - One disconnected, endpoint:', ep, fileDescriptor);
        });
        socket.on('message', function (msg) {
            if(Buffer.isBuffer(msg)) msg = msg.toString();
            try{ msg =  JSON.parse(msg)}catch (e){}
            self.onMessage(msg);
        });
        socket.monitor(500, 0);
        console.log(`Publisher bound on ${this.uri}`);
        socket.bind(this.uri);
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
module.exports = Publisher;