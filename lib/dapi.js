const AuthService = require('./authService/authService');
const Server = require('./server/server');
const {Logger} = require('./utils');
class Dapi {
    constructor(config) {
        this.logger = new Logger();
        this.logger.level=this.logger.VERBOSE;
        
        this.config = config;
        this.authService = new AuthService(this);

        this.server = new Server(this);
    }

}
module.exports = Dapi;
