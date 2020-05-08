const {
  client: {
    converters: {
      jsonToProtobufFactory,
      protobufToJsonFactory,
    },
  },
  server: {
    jsonToProtobufHandlerWrapper,
    error: {
      wrapInErrorHandlerFactory,
    },
  },
} = require('@dashevo/grpc-common');

const { Metadata } = require('grpc');

const {
  SendTransactionRequest,
  GetTransactionRequest,
  GetStatusRequest,
  GetBlockRequest,
  pbjs: {
    SendTransactionRequest: PBJSSendTransactionRequest,
    SendTransactionResponse: PBJSSendTransactionResponse,
    GetTransactionRequest: PBJSGetTransactionRequest,
    GetTransactionResponse: PBJSGetTransactionResponse,
    GetStatusRequest: PBJSGetStatusRequest,
    GetStatusResponse: PBJSGetStatusResponse,
    GetBlockRequest: PBJSGetBlockRequest,
    GetBlockResponse: PBJSGetBlockResponse,
  },
} = require('@dashevo/dapi-grpc');

const log = require('../../../log');

const { version } = require('../../../../package.json');

const getBlockHandlerFactory = require(
  './getBlockHandlerFactory',
);
const getStatusHandlerFactory = require(
  './getStatusHandlerFactory',
);
const getTransactionHandlerFactory = require(
  './getTransactionHandlerFactory',
);
const sendTransactionHandlerFactory = require(
  './sendTransactionHandlerFactory',
);

/**
 * @param {InsightAPI} insightAPI
 * @returns {Object<string, function>}
 */
function coreHandlersFactory(insightAPI) {
  const metadata = new Metadata();
  metadata.set('version', version);

  const wrapInErrorHandler = wrapInErrorHandlerFactory(log, metadata);

  // getBlock
  const getBlockHandler = getBlockHandlerFactory(insightAPI);
  const wrappedGetBlock = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetBlockRequest,
      PBJSGetBlockRequest,
    ),
    protobufToJsonFactory(
      PBJSGetBlockResponse,
    ),
    wrapInErrorHandler(getBlockHandler),
  );

  // getStatus
  const getStatusHandler = getStatusHandlerFactory(insightAPI);
  const wrappedGetStatus = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetStatusRequest,
      PBJSGetStatusRequest,
    ),
    protobufToJsonFactory(
      PBJSGetStatusResponse,
    ),
    wrapInErrorHandler(getStatusHandler),
  );

  // getTransaction
  const getTransactionHandler = getTransactionHandlerFactory(insightAPI);
  const wrappedGetTransaction = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetTransactionRequest,
      PBJSGetTransactionRequest,
    ),
    protobufToJsonFactory(
      PBJSGetTransactionResponse,
    ),
    wrapInErrorHandler(getTransactionHandler),
  );

  // sendTransaction
  const sendTransactionHandler = sendTransactionHandlerFactory(insightAPI);
  const wrappedSendTransaction = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      SendTransactionRequest,
      PBJSSendTransactionRequest,
    ),
    protobufToJsonFactory(
      PBJSSendTransactionResponse,
    ),
    wrapInErrorHandler(sendTransactionHandler),
  );

  return {
    getBlock: wrappedGetBlock,
    getStatus: wrappedGetStatus,
    getTransaction: wrappedGetTransaction,
    sendTransaction: wrappedSendTransaction,
  };
}

module.exports = coreHandlersFactory;
