const dotenv = require('dotenv');
const grpc = require('grpc');

const config = require('../lib/config');
const { validateConfig } = require('../lib/config/validator');
const log = require('../lib/log');
const createServer = require('../lib/grpcServer/createServer');
const BloomFilterCollection = require('../lib/bloomFilter/BloomFilterCollection');

const ZmqClient = require('../lib/externalApis/dashcore/ZmqClient');
const testTransactionAgainstFilterCollectionFactory = require('../lib/transactionsFilter/testTransactionAgainstFilterCollectionFactory');
const emitBlockEventToFilterCollectionFactory = require('../lib/transactionsFilter/emitBlockEventToFilterCollectionFactory');
const dashCoreRpcClient = require('../lib/externalApis/dashcore/rpc');

async function main() {
  /* Application start */
  dotenv.config();

  const configValidationResult = validateConfig(config);
  if (!configValidationResult.isValid) {
    configValidationResult.validationErrors.forEach(log.error);
    log.error('Aborting DAPI startup due to config validation errors');
    process.exit();
  }

  // Subscribe to events from dashcore
  const dashCoreZmqClient = new ZmqClient(config.dashcore.zmq.host, config.dashcore.zmq.port);
  // // Bind logs on ZMQ connection events
  dashCoreZmqClient.on(ZmqClient.events.DISCONNECTED, log.warn);
  dashCoreZmqClient.on(ZmqClient.events.CONNECTION_DELAY, log.warn);
  dashCoreZmqClient.on(ZmqClient.events.MONITOR_ERROR, log.warn);
  // // Wait until zmq connection is established
  log.info(`Connecting to dashcore ZMQ on ${dashCoreZmqClient.connectionString}`);
  await dashCoreZmqClient.start();
  log.info('Connection to ZMQ established.');

  const bloomFilterCollection = new BloomFilterCollection();
  const emitBlockToFilterCollection = emitBlockEventToFilterCollectionFactory(
    bloomFilterCollection,
    dashCoreRpcClient.getBlock,
  );
  const testTransactionAgainstFilterCollection = testTransactionAgainstFilterCollectionFactory(
    bloomFilterCollection,
    dashCoreRpcClient.getRawTransaction,
  );

  dashCoreZmqClient.on('newTx', testTransactionAgainstFilterCollection);

  dashCoreZmqClient.on('newBlock', emitBlockToFilterCollection);

  // Start RPC server
  log.info('Starting GRPC server');

  const grpcServer = createServer();

  grpcServer.bind(
    `0.0.0.0:${config.grpcServer.port}`,
    grpc.ServerCredentials.createInsecure(),
  );

  grpcServer.start();

  log.info(`GRPC server is listening on port ${config.grpcServer.port}`);


  // Display message that everything is ok
  log.info(`DAPI TxFilterStream process is up and running in ${config.livenet ? 'livenet' : 'testnet'} mode`);
  log.info(`Network is ${config.network}`);
}

main().catch((e) => {
  log.error(e.stack);
  process.exit();
});
