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
    GetIdentitiesByPublicKeyHashesRequest,
    GetIdentityIdsByPublicKeyHashesRequest,
    StateTransitionResultsRequest,
    pbjs: {
      BroadcastStateTransitionRequest: PBJSBroadcastStateTransitionRequest,
      BroadcastStateTransitionResponse: PBJSBroadcastStateTransitionResponse,
      GetIdentityRequest: PBJSGetIdentityRequest,
      GetIdentityResponse: PBJSGetIdentityResponse,
      GetDataContractRequest: PBJSGetDataContractRequest,
      GetDataContractResponse: PBJSGetDataContractResponse,
      GetDocumentsRequest: PBJSGetDocumentsRequest,
      GetDocumentsResponse: PBJSGetDocumentsResponse,
      GetIdentitiesByPublicKeyHashesResponse: PBJSGetIdentitiesByPublicKeyHashesResponse,
      GetIdentitiesByPublicKeyHashesRequest: PBJSGetIdentitiesByPublicKeyHashesRequest,
      GetIdentityIdsByPublicKeyHashesResponse: PBJSGetIdentityIdsByPublicKeyHashesResponse,
      GetIdentityIdsByPublicKeyHashesRequest: PBJSGetIdentityIdsByPublicKeyHashesRequest,
      StateTransitionResultsRequest: PBJSStateTransitionResultsRequest,
      StateTransitionResultsResponse: PBJSStateTransitionResultsResponse,
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
const getIdentitiesByPublicKeyHashesHandlerFactory = require(
  './getIdentitiesByPublicKeyHashesHandlerFactory',
);
const getIdentityIdsByPublicKeyHashesHandlerFactory = require(
  './getIdentityIdsByPublicKeyHashesHandlerFactory',
);
const waitForStateTransitionResultHandlerFactory = require(
  './waitForStateTransitionResultHandlerFactory',
);

/**
 * @param {jaysonClient} rpcClient
 * @param {WsClient} tenderDashWsClient
 * @param {DriveStateRepository} driveStateRepository
 * @param {DashPlatformProtocol} dpp
 * @param {boolean} isProductionEnvironment
 * @returns {Object<string, function>}
 */
function platformHandlersFactory(
  rpcClient,
  tenderDashWsClient,
  driveStateRepository,
  dpp,
  isProductionEnvironment,
) {
  const wrapInErrorHandler = wrapInErrorHandlerFactory(log, isProductionEnvironment);

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

  // getIdentitiesByPublicKeyHashes
  const getIdentitiesByPublicKeyHashesHandler = getIdentitiesByPublicKeyHashesHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetIdentitiesByPublicKeyHashes = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetIdentitiesByPublicKeyHashesRequest,
      PBJSGetIdentitiesByPublicKeyHashesRequest,
    ),
    protobufToJsonFactory(
      PBJSGetIdentitiesByPublicKeyHashesResponse,
    ),
    wrapInErrorHandler(getIdentitiesByPublicKeyHashesHandler),
  );

  // getIdentityIdsByPublicKeyHashes
  const getIdentityIdsByPublicKeyHashesHandler = getIdentityIdsByPublicKeyHashesHandlerFactory(
    driveStateRepository, handleAbciResponseError,
  );

  const wrappedGetIdentityIdsByPublicKeyHashes = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetIdentityIdsByPublicKeyHashesRequest,
      PBJSGetIdentityIdsByPublicKeyHashesRequest,
    ),
    protobufToJsonFactory(
      PBJSGetIdentityIdsByPublicKeyHashesResponse,
    ),
    wrapInErrorHandler(getIdentityIdsByPublicKeyHashesHandler),
  );

  // waitForStateTransitionResult
  const waitForStateTransitionResultHandler = waitForStateTransitionResultHandlerFactory(
    driveStateRepository,
    tenderDashWsClient,
    dpp,
  );

  const wrappedWaitForStateTransitionResult = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      StateTransitionResultsRequest,
      PBJSStateTransitionResultsRequest,
    ),
    protobufToJsonFactory(
      PBJSStateTransitionResultsResponse,
    ),
    wrapInErrorHandler(waitForStateTransitionResultHandler),
  );

  return {
    broadcastStateTransition: wrappedBroadcastStateTransition,
    getIdentity: wrappedGetIdentity,
    getDocuments: wrappedGetDocuments,
    getDataContract: wrappedGetDataContract,
    getIdentitiesByPublicKeyHashes: wrappedGetIdentitiesByPublicKeyHashes,
    getIdentityIdsByPublicKeyHashes: wrappedGetIdentityIdsByPublicKeyHashes,
    waitForStateTransitionResult: wrappedWaitForStateTransitionResult,
  };
}

module.exports = platformHandlersFactory;
