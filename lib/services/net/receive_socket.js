class ReceiveSocket extends require('./socketbase') {
  constructor(params) {
    super(params);
  }

  accept(socketType) {
    super.attach(socketType);
    this.socket.on('connect', (fileDescriptor, ep) => {
      console.log('Publisher - connect, endpoint:', ep, fileDescriptor);
    });

    this.socket.on('disconnect', (fileDescriptor, replierEndpoint) => {
      console.log(`${self.constructor.name} - Node (${fileDescriptor}) disconnected from endpoint.`);
    });

    this.socket.conect(this.uri);
  }
}

module.exports = ReceiveSocket;
