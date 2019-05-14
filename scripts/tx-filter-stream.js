const dotenv = require('dotenv');
const grpc = require('grpc');

const config = require('../lib/config');
const { validateConfig } = require('../lib/config/validator');
const log = require('../lib/log');

const ZmqClient = require('../lib/externalApis/dashcore/ZmqClient');

const createServerFactory = require('../lib/grpcServer/createServerFactory');
const BloomFilterEmitterCollection = require('../lib/bloomFilter/emitter/BloomFilterEmitterCollection');

const testTransactionAgainstFilterCollectionFactory = require('../lib/transactionsFilter/testTransactionAgainstFilterCollectionFactory');
const emitBlockEventToFilterCollectionFactory = require('../lib/transactionsFilter/emitBlockEventToFilterCollectionFactory');
const testTransactionsAgainstFilter = require('../lib/transactionsFilter/testTransactionAgainstFilter');
const getTransactionsByFilterHandlerFactory = require('../lib/grpcServer/handlers/getTransactionsByFilterHandlerFactory');

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

  const bloomFilterEmitterCollection = new BloomFilterEmitterCollection();
  const emitBlockToFilterCollection = emitBlockEventToFilterCollectionFactory(
    bloomFilterEmitterCollection,
  );
  const testTransactionAgainstFilterCollection = testTransactionAgainstFilterCollectionFactory(
    bloomFilterEmitterCollection,
  );

  dashCoreZmqClient.on(dashCoreZmqClient.topics.rawtx, testTransactionAgainstFilterCollection);
  dashCoreZmqClient.on(dashCoreZmqClient.topics.rawtxlock, testTransactionAgainstFilterCollection);
  dashCoreZmqClient.on(dashCoreZmqClient.topics.rawblock, emitBlockToFilterCollection);

  // Start GRPC server
  log.info('Starting GRPC server');

  const getTransactionsByFilterHandler = getTransactionsByFilterHandlerFactory(
    bloomFilterEmitterCollection,
    testTransactionsAgainstFilter,
  );

  const createServer = createServerFactory(getTransactionsByFilterHandler);

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
