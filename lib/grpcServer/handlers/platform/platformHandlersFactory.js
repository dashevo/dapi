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

const {
  v0: {
    BroadcastStateTransitionRequest,
    GetIdentityRequest,
    GetDataContractRequest,
    GetDocumentsRequest,
    GetIdentityByPublicKeyHashRequest,
    GetIdentityIdByPublicKeyHashRequest,
    pbjs: {
      BroadcastStateTransitionRequest: PBJSBroadcastStateTransitionRequest,
      BroadcastStateTransitionResponse: PBJSBroadcastStateTransitionResponse,
      GetIdentityRequest: PBJSGetIdentityRequest,
      GetIdentityResponse: PBJSGetIdentityResponse,
      GetDataContractRequest: PBJSGetDataContractRequest,
      GetDataContractResponse: PBJSGetDataContractResponse,
      GetDocumentsRequest: PBJSGetDocumentsRequest,
      GetDocumentsResponse: PBJSGetDocumentsResponse,
      GetIdentityByPublicKeyHashResponse: PBJSGetIdentityByPublicKeyHashResponse,
      GetIdentityByPublicKeyHashRequest: PBJSGetIdentityByPublicKeyHashRequest,
      GetIdentityIdByPublicKeyHashResponse: PBJSGetIdentityIdByPublicKeyHashResponse,
      GetIdentityIdByPublicKeyHashRequest: PBJSGetIdentityIdByPublicKeyHashRequest,
    },
  },
} = require('@dashevo/dapi-grpc');

const log = require('../../../log');

const handleAbciResponseError = require('../handleAbciResponseError');

const getIdentityHandlerFactory = require(
  './getIdentityHandlerFactory',
);
const broadcastStateTransitionHandlerFactory = require(
  './broadcastStateTransitionHandlerFactory',
);
const getDocumentsHandlerFactory = require(
  './getDocumentsHandlerFactory',
);
const getDataContractHandlerFactory = require(
  './getDataContractHandlerFactory',
);
const getIdentityByPublicKeyHashHandlerFactory = require(
  './getIdentityByPublicKeyHashHandlerFactory',
);
const getIdentityIdByPublicKeyHashHandlerFactory = require(
  './getIdentityIdByPublicKeyHashHandlerFactory',
);

/**
 * @param {jaysonClient} rpcClient
 * @param {DriveStateRepository} driveStateRepository
 * @returns {Object<string, function>}
 */
function platformHandlersFactory(rpcClient, driveStateRepository) {
  const wrapInErrorHandler = wrapInErrorHandlerFactory(log);

  // broadcastStateTransition
  const broadcastStateTransitionHandler = broadcastStateTransitionHandlerFactory(
    rpcClient,
    handleAbciResponseError,
  );

  const wrappedBroadcastStateTransition = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      BroadcastStateTransitionRequest,
      PBJSBroadcastStateTransitionRequest,
    ),
    protobufToJsonFactory(
      PBJSBroadcastStateTransitionResponse,
    ),
    wrapInErrorHandler(broadcastStateTransitionHandler),
  );

  // getIdentity
  const getIdentityHandler = getIdentityHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetIdentity = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetIdentityRequest,
      PBJSGetIdentityRequest,
    ),
    protobufToJsonFactory(
      PBJSGetIdentityResponse,
    ),
    wrapInErrorHandler(getIdentityHandler),
  );

  // getDocuments
  const getDocumentsHandler = getDocumentsHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetDocuments = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetDocumentsRequest,
      PBJSGetDocumentsRequest,
    ),
    protobufToJsonFactory(
      PBJSGetDocumentsResponse,
    ),
    wrapInErrorHandler(getDocumentsHandler),
  );

  // getDataContract
  const getDataContractHandler = getDataContractHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetDataContract = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetDataContractRequest,
      PBJSGetDataContractRequest,
    ),
    protobufToJsonFactory(
      PBJSGetDataContractResponse,
    ),
    wrapInErrorHandler(getDataContractHandler),
  );

  // getIdentityByPublicKeyHash
  const getIdentityByPublicKeyHashHandler = getIdentityByPublicKeyHashHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetIdentityByPublicKeyHash = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetIdentityByPublicKeyHashRequest,
      PBJSGetIdentityByPublicKeyHashRequest,
    ),
    protobufToJsonFactory(
      PBJSGetIdentityByPublicKeyHashResponse,
    ),
    wrapInErrorHandler(getIdentityByPublicKeyHashHandler),
  );

  // getIdentityIdByPublicKeyHash
  const getIdentityIdByPublicKeyHashHandler = getIdentityIdByPublicKeyHashHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetIdentityIdByPublicKeyHash = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetIdentityIdByPublicKeyHashRequest,
      PBJSGetIdentityIdByPublicKeyHashRequest,
    ),
    protobufToJsonFactory(
      PBJSGetIdentityIdByPublicKeyHashResponse,
    ),
    wrapInErrorHandler(getIdentityIdByPublicKeyHashHandler),
  );

  return {
    broadcastStateTransition: wrappedBroadcastStateTransition,
    getIdentity: wrappedGetIdentity,
    getDocuments: wrappedGetDocuments,
    getDataContract: wrappedGetDataContract,
    getIdentityByFirstPublicKey: wrappedGetIdentityByPublicKeyHash,
    getIdentityIdByFirstPublicKey: wrappedGetIdentityIdByPublicKeyHash,
    getIdentityByPublicKeyHash: wrappedGetIdentityByPublicKeyHash,
    getIdentityIdByPublicKeyHash: wrappedGetIdentityIdByPublicKeyHash,
  };
}

module.exports = platformHandlersFactory;
