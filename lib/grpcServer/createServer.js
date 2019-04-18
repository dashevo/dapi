const grpc = require('grpc');
const { loadPackageDefinition } = require('@dashevo/dapi-grpc');

const getTransactionsByFilterHandlerFactory = require('./handlers/getTransactionsByFilterHandlerFactory');

function createServer() {
  const {
    routeguide: {
      RouteGuide:
        { service: grpcServiceDefinition },
    },
  } = loadPackageDefinition();

  const server = new grpc.Server();

  server.addService(grpcServiceDefinition, {
    getTransactionsByFilter: getTransactionsByFilterHandlerFactory(),
  });

  return server;
}

module.exports = createServer;
