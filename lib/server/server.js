const routes = require('./routes');
const express = require('express');
const bodyParser = require('body-parser')

class Server {
    constructor(app) {
        if (!app.hasOwnProperty('config') || !app.config.hasOwnProperty('server')) {
            throw new Error('Missing config for server.');
        }
        if (!app.hasOwnProperty('config') || !app.config.hasOwnProperty('server') || (app.config.server.hasOwnProperty('enable') && app.config.server.enable === false)) {
            app.server = null;
            return false;
        }

        // QDEVTEMP
        let portfinder = require('portfinder')
        portfinder.basePort = 3000
        portfinder.getPortPromise()
            .then(p => {

                app.server = express();
                app.server.use(bodyParser.json());
                app.server.use(bodyParser.urlencoded({ extended: true }));
                routes.setup(app);

                app.config.server.port = p

                app.server.listen(app.config.server.port);
                app.logger.notice('Server listening on port:', app.config.server.port);
            })
        //QDEVTEMP END

        //Original:
        // app.server = express();
        // app.server.use(bodyParser.json());
        // app.server.use(bodyParser.urlencoded({ extended: true }));
        // routes.setup(app);
        // app.server.listen(app.config.server.port);
        // app.logger.notice('Server listening on port:', app.config.server.port);


    }
}
module.exports = Server;