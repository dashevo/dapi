const zmq = require('zmq');
class Requester {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://')==-1)? `tcp://${params.uri}` : params.uri;
    }

    attach() {
        let socket = this.socket = zmq.socket('req');
        socket.on('connect', function (fileDescriptor, pairEndpoint) {
            console.log(`Requester - Connected to ${this.uri}.`);
        });
        socket.on('disconnect', function (fileDescriptor, pairEndpoint) {
            console.log(`Requester - Disconnected from ${this.uri}.`);
        });
        socket.on('message', function (msg) {
            console.log(`Requester - Received message ${this.msg}`);
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