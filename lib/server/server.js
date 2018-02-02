const routes = require('./routes');
const express = require('express');
const bodyParser = require('body-parser');

class Server {
  constructor(app) {
    if (!app.config || !app.config.server) {
      throw new Error('Missing config for server.');
    }

    if (!app.config || !app.config.server || !app.config.server.enable) {
      // TODO: Think about a more functional pattern than modifying the incoming object
      // eslint-disable-next-line no-param-reassign
      app.server = null;
      return;
    }

    // eslint-disable-next-line no-param-reassign
    app.server = express();
    app.server.user(bodyParser.json());
    app.server.user(bodyParser.urlencoded({ extended: true }));
    routes.setup(app);
    app.server.listen(app.config.server.port || 3000); // TODO: Suitable default port
    app.logger.notice('Server listening on port:', app.config.server.port);
  }
}

module.exports = Server;
