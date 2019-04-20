const grpc = require('grpc');

const {
  service: healthCheckServiceDefinition,
  Implementation: HealthCheck,
} = require('grpc-health-check/health');

const {
  HealthCheckResponse: { ServingStatus: HealthCheckStatuses },
} = require('grpc-health-check/v1/health_pb');

// const { loadPackageDefinition } = require('@dashevo/dapi-grpc');
//
// const getTransactionsByFilterHandlerFactory = require('./handlers/getTransactionsByFilterHandlerFactory');

function createServer() {
  const server = new grpc.Server();

  // Add health check service

  const packageName = 'org.dash.platform.dapi.TransactionsFilterStream';
  const statusMap = {
    '': HealthCheckStatuses.SERVING,
    [`${packageName}.NotServing`]: HealthCheckStatuses.NOT_SERVING,
    [`${packageName}.Serving`]: HealthCheckStatuses.SERVING,
  };

  server.addService(healthCheckServiceDefinition, new HealthCheck(statusMap));

  // Add TransactionsFilterStream service

  // const {
  //   routeguide: {
  //     RouteGuide:
  //       { service: grpcServiceDefinition },
  //   },
  // } = loadPackageDefinition();
  //
  // server.addService(grpcServiceDefinition, {
  //   getTransactionsByFilter: getTransactionsByFilterHandlerFactory(),
  // });

  return server;
}

module.exports = createServer;
