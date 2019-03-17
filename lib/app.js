// Entry point for DAPI.
const dotenv = require('dotenv');

// Load config from .env
dotenv.config();

const { isRegtest } = require('./utils');
const config = require('./config');
const { validateConfig } = require('./config/validator');
const log = require('./log');
const rpcServer = require('./rpcServer/server');
const QuorumService = require('./services/quorum');
const ZmqClient = require('./externalApis/dashcore/ZmqClient');
const DashDriveAdapter = require('./externalApis/dashDriveAdapter');
const { SpvService } = require('./services/spv');
const insightAPI = require('./externalApis/insight');
const dashCoreRpcClient = require('./externalApis/dashcore/rpc');
const userIndex = require('./services/userIndex');

async function main() {
  /* Application start */
  const configValidationResult = validateConfig(config);
  if (!configValidationResult.isValid) {
    configValidationResult.validationErrors.forEach(log.error);
    log.log('Aborting DAPI startup due to config validation errors');
    process.exit();
  }

  // Subscribe to events from dashcore
  const dashCoreZmqClient = new ZmqClient(config.dashcore.zmq.host, config.dashcore.zmq.port);
  // Bind logs on ZMQ connection events
  dashCoreZmqClient.on(ZmqClient.events.DISCONNECTED, log.warn);
  dashCoreZmqClient.on(ZmqClient.events.CONNECTION_DELAY, log.warn);
  dashCoreZmqClient.on(ZmqClient.events.MONITOR_ERROR, log.warn);
  // Wait until zmq connection is established
  log.info(`Connecting to dashcore ZMQ on ${dashCoreZmqClient.connectionString}`);
  await dashCoreZmqClient.start();
  log.info('Connection to ZMQ established.');

  // Start quorum service
  const quorumService = new QuorumService({
    dashCoreRpcClient,
    dashCoreZmqClient,
    log,
  });
  quorumService.start(dashCoreZmqClient);

  // Start SPV service
  const spvService = new SpvService();
  if (isRegtest(config.network)) {
    log.info(`SPV service running with ${spvService.clients.length} connected clients`);
  } else {
    log.warn('SPV service will not work in regtest mode');
  }

  const dashDriveAPI = new DashDriveAdapter({
    host: config.dashDrive.host,
    port: config.dashDrive.port,
  });

  userIndex.start({
    dashCoreZmqClient,
    dashCoreRpcClient,
    log,
  });

  // Start RPC server
  log.info('Starting RPC server');
  rpcServer.start(
    config.server.port,
    config.network,
    spvService,
    insightAPI,
    dashCoreRpcClient,
    dashDriveAPI,
    userIndex,
  );
  log.info(`RPC server is listening on port ${config.server.port}`);

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
