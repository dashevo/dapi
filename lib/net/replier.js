const zmq = require('zmq');
class Replier {
    constructor(params) {
        this.uri = (params.uri.indexOf('tcp://')==-1)? `tcp://${params.uri}` : params.uri;
    }

    attach() {
        let socket = this.socket = zmq.socket('rep');
        socket.on('listen', function (fileDescriptor, replierEndpoint) {
            console.log('Replier - Listening for new connection:');
        });
        socket.on('accept', function (fileDescriptor, replierEndpoint) {
            console.log(`Replier - Node (${fileDescriptor}) Connected`);
        });
        socket.on('disconnect', function (fileDescriptor, replierEndpoint) {
            console.log(`Replier - Node (${fileDescriptor}) disconnected from endpoint.`);
        });
        socket.on('message', function (msg) {
            console.log(`Replier - Received message ${msg}`);
        });
        socket.monitor(500, 0);
        console.log(`Replier bound to ${this.uri}`);
        socket.bind(this.uri);
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
module.exports = Replier;