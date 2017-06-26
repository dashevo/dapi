const zmq = require('zmq');
function defaultOnMessage(msg) {
    console.log(`Subscriber - Received message`,msg);
}
class Subscriber {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://') == -1) ? `tcp://${params.uri}` : params.uri;
        this.onMessage = params.hasOwnProperty('onMessage') ? params.onMessage : defaultOnMessage.bind(this);
    }

    attach() {
        let self = this;
        let socket = this.socket = zmq.socket('sub');

        socket.on('connect', function (fileDescriptor, ep) {
            console.log('Subscriber - connect, endpoint:', ep, fileDescriptor);
        });
        socket.on('listen', function (fileDescriptor, ep) {
            console.log('Subscriber - listen, endpoint:', ep, fileDescriptor);
        });
        socket.on('accept', function (fileDescriptor, ep) {
            console.log('Subscriber - accepting entering connexion., endpoint:', ep, fileDescriptor);
        });
        socket.on('disconnect', function (fileDescriptor, ep) {
            console.log('Subscriber - One disconnected, endpoint:', ep, fileDescriptor);
        });
        socket.on('message', function (msg) {
            if(Buffer.isBuffer(msg)) msg = msg.toString();
            try{ msg =  JSON.parse(msg)}catch (e){}
            self.onMessage(msg);
        });
        socket.monitor(500, 0);
        socket.connect(this.uri);
        socket.subscribe('')
        console.log(`Subscriber trying to connect on ${this.uri}`);
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
module.exports = Subscriber;