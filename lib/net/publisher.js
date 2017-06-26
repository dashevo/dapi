const zmq = require('zmq');

class Publisher {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://') == -1) ? `tcp://${params.uri}` : params.uri;
    }

    attach() {
        let socket = this.socket = zmq.socket('pub');
        socket.on('connect', function (fileDescriptor, ep) {
            console.log('connect, endpoint:', ep, fileDescriptor);
        });
        socket.on('listen', function (fileDescriptor, ep) {
            console.log('listen, endpoint:', ep, fileDescriptor);
        });
        socket.on('accept', function (fileDescriptor, ep) {
            console.log('accepting entering connexion., endpoint:', ep, fileDescriptor);
        });
        socket.on('disconnect', function (fileDescriptor, ep) {
            console.log('One disconnected, endpoint:', ep, fileDescriptor);
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