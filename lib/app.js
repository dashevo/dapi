// Entry point for DAPI.
const jayson = require('jayson');

const config = require('./config');
const log = require('./log');
const rpcCommands = require('./rpc');
const quorumService = require('./services/quorum');

// Subscribe to events from dashcore
quorumService.start();

// Init RPC server
const server = jayson.server(rpcCommands);
const { port } = config.server;
server.http().listen(port);

log.info(`DAPI is running in ${config.name} mode`);
log.info(`Insight uri is ${config.insightUri}`);
log.info(`RPC server is listening on port ${port}`);

// break on ^C
process.on('SIGINT', () => {
  process.exit();
});
