const AuthService = require('./services/authService/authService');
const { Logger } = require('./utils/utils');
const insight = require('./api/insight');
const config = require('./config');

class Dapi {
  constructor() {
    this.logger = new Logger();
    this.logger.level = this.logger.VERBOSE;
    this.config = config;
    this.insight = insight;
    this.authService = new AuthService(this);
  }
}
module.exports = Dapi;

// Override node v8 promises for now
global.Promise = require('bluebird');
