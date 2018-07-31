// Entry point for DAPI.
const config = require('./config');
const log = require('./log');
const rpcServer = require('./rpcServer');
const quorumService = require('./services/quorum');
const ZmqClient = require('./api/dashcore/ZmqClient');
const coreP2pService = require('./services/corep2p');
const insightAPI = require('./api/insight');
const dashcoreAPI = require('./api/dashcore/rpc');
const { DashDrive } = require('@dashevo/dash-schema/vmn');
const userIndex = require('./services/userIndex');

// Emulated dd.
const dashDrive = new DashDrive();
// Mock up for virtual drive context
dashDrive.DashCore.getuserbyid = function getUserById(uid) {
  const user = userIndex.getUserById(uid);
  return { blockchainuser: { uname: user.uname } };
};

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

  // Start coreP2pService service
  if (!config.isRegtestNetwork()) {
    log.info(`SPV service running with ${coreP2pService.spvService.clients.length} connected clients`);
    log.info(`MnList service running with ${coreP2pService.mnListService.todo} todo`);
  } else {
    // TODO: What is this?
    log.warn('SPV service will not work in regtest mode');
  }

  // Start RPC server
  log.info('Starting RPC server');
  rpcServer.start(
    config.server.port,
    config.network,
    coreP2pService,
    insightAPI,
    dashcoreAPI,
    dashDrive,
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
