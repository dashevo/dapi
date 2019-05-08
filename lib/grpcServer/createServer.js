const grpc = require('grpc');

const {
  service: healthCheckServiceDefinition,
  Implementation: HealthCheck,
} = require('grpc-health-check/health');

const {
  HealthCheckResponse: { ServingStatus: healthCheckStatuses },
} = require('grpc-health-check/v1/health_pb');

const { loadPackageDefinition } = require('@dashevo/dapi-grpc');

const testTransactionsAgainstFilter = require('../transactionsFilter/testTransactionAgainstFilter');
const getTransactionsByFilterHandlerFactory = require('./handlers/getTransactionsByFilterHandlerFactory');

/**
 * @param {BloomFilterCollection} bloomFilterCollection - bloom filter collection
 * to be used by the getTransactionByFilter service
 * @return {grpc.Server}
 */
function createServer(bloomFilterCollection) {
  const server = new grpc.Server();

  // Add health check service

  const statusMap = {
    '': healthCheckStatuses.SERVING,
    'org.dash.platform.dapi.TransactionsFilterStream': healthCheckStatuses.SERVING,
  };

  server.addService(healthCheckServiceDefinition, new HealthCheck(statusMap));

  // Add TransactionsFilterStream service

  const {
    TransactionsFilterStream,
  } = loadPackageDefinition();

  server.addService(TransactionsFilterStream.service, {
    getTransactionsByFilter: getTransactionsByFilterHandlerFactory(
      bloomFilterCollection,
      testTransactionsAgainstFilter,
    ),
  });

  return server;
}

module.exports = createServer;
