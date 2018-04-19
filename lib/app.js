// Entry point for DAPI.
const config = require('./config');
const log = require('./log');
const rpcServer = require('./rpcServer');
const quorumService = require('./services/quorum');
const ZmqClient = require('./api/dashcore/ZmqClient');
const SpvService = require('./services/spv');

async function main() {
  /* Application start */

  // Subscribe to events from dashcore
  const dashcoreZmqClient = new ZmqClient(config.dashcore.zmq.host, config.dashcore.zmq.port);
  // Bind logs on ZMQ connection events
  dashcoreZmqClient.on(ZmqClient.events.DISCONNECTED, log.warn);
  dashcoreZmqClient.on(ZmqClient.events.CONNECTION_DELAY, log.warn);
  dashcoreZmqClient.on(ZmqClient.events.MONITOR_ERROR, log.warn);
  // Wait until zmq connection is established
  log.info(`Connecting to dashcore ZMQ on ${dashcoreZmqClient.connectionString}`);
  await dashcoreZmqClient.start();
  log.info('Connection to ZMQ established.');

  // Start quorum service
  quorumService.start(dashcoreZmqClient);

  // Start RPC server
  log.info('Starting RPC server');
  rpcServer.start(config.server.port, config.network);
  log.info(`RPC server is listening on port ${config.server.port}`);

  // Start SPV service
  const spvService = new SpvService();
  if (!config.isRegtestNetwork()) {
    log.info(`SPV service running with ${spvService.clients.length} connected clients`);
  } else {
    log.warn('SPV service will not work in regtest mode, since regtest doesn\'t support p2p connections');
  }

  // Display message that everything is ok
  log.info(`Insight uri is ${config.insightUri}`);
  log.info(`DAPI node is up and running in ${config.livenet ? 'livenet' : 'testnet'} mode`);
  log.info(`Network is ${config.network}`);
}

main().catch((e) => {
  log.error(e.stack);
  process.exit();
});

// break on ^C
process.on('SIGINT', () => {
  process.exit();
});
