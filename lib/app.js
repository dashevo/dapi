// Entry point for DAPI.
const jayson = require('jayson');

const config = require('./config');
const rpc = require('./rpc');

const log = console;
const server = jayson.server(rpc);

const port = 4019;

server.http().listen(port);
log.info(`DAPI is running in ${config.name} mode`);
log.info(`Insight uri is ${config.insightUri}`);
log.info(`RPC server is listening on port ${port}`);

