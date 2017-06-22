const zmq = require('zmq');
class Requester {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://')==-1)? `tcp://${params.uri}` : params.uri;
    }

    attach() {
        let socket = this.socket = zmq.socket('req');
        let uri = this.uri;
        socket.on('connect', function (fileDescriptor, pairEndpoint) {
            console.log(`Requester - Connected to ${uri}.`);
        });
        socket.on('disconnect', function (fileDescriptor, pairEndpoint) {
            console.log(`Requester - Disconnected from ${uri}.`);
        });
        socket.on('message', function (msg) {
            console.log(`Requester - Received message ${uri}`);
        });
        socket.monitor(500, 0);
        socket.connect(this.uri);
        console.log(`Requester - Trying to connect to ${this.uri}`);
        return this.socket;
    }
    detach(){
        if(this.socket){
            this.socket.close();
        }
        return true;
    }
}
;
module.exports = Requester;