const AuthService = require('./authService/authService');
const Server = require('./server/server');
const ZMQ = require('./zmq/zmq');
class Dapi {
    constructor(config) {
        this.config = config;
        this.authService = new AuthService(this);

        this.zmq = new ZMQ(this);
        this.server = new Server(this);
    }

}
module.exports = Dapi;
