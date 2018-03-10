// Entry point for DAPI.
const config = require('./config');
const log = require('./log');
const rpcServer = require('./rpcServer');
const quorumService = require('./services/quorum');

/* Application start */

// Subscribe to events from dashcore
quorumService.start();

// Start RPC server
rpcServer.start(config.server.port);

log.info(`DAPI is running in ${config.livenet ? 'livenet' : 'testnet'} mode`);
log.info(`Insight uri is ${config.insightUri}`);

// break on ^C
process.on('SIGINT', () => {
  process.exit();
});
