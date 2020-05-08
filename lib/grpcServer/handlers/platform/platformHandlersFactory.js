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
    checks: {
      checkVersionWrapperFactory,
    },
  },
} = require('@dashevo/grpc-common');

const {
  ApplyStateTransitionRequest,
  GetIdentityRequest,
  GetDataContractRequest,
  GetDocumentsRequest,
  pbjs: {
    ApplyStateTransitionRequest: PBJSApplyStateTransitionRequest,
    ApplyStateTransitionResponse: PBJSApplyStateTransitionResponse,
    GetIdentityRequest: PBJSGetIdentityRequest,
    GetIdentityResponse: PBJSGetIdentityResponse,
    GetDataContractRequest: PBJSGetDataContractRequest,
    GetDataContractResponse: PBJSGetDataContractResponse,
    GetDocumentsRequest: PBJSGetDocumentsRequest,
    GetDocumentsResponse: PBJSGetDocumentsResponse,
  },
} = require('@dashevo/dapi-grpc');

const log = require('../../../log');

const handleAbciResponseError = require('../handleAbciResponseError');

const getIdentityHandlerFactory = require(
  './getIdentityHandlerFactory',
);
const applyStateTransitionHandlerFactory = require(
  './applyStateTransitionHandlerFactory',
);
const getDocumentsHandlerFactory = require(
  './getDocumentsHandlerFactory',
);
const getDataContractHandlerFactory = require(
  './getDataContractHandlerFactory',
);

/**
 * @param {jaysonClient} rpcClient
 * @param {DriveStateRepository} driveStateRepository
 * @param {string} version
 * @returns {Object<string, function>}
 */
function platformHandlersFactory(rpcClient, driveStateRepository, version) {
  const wrapInErrorHandler = wrapInErrorHandlerFactory(log);
  const checkVersionWrapper = checkVersionWrapperFactory(version);

  // applyStateTransition
  const applyStateTransitionHandler = applyStateTransitionHandlerFactory(
    rpcClient,
    handleAbciResponseError,
  );

  const wrappedApplyStateTransition = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      ApplyStateTransitionRequest,
      PBJSApplyStateTransitionRequest,
    ),
    protobufToJsonFactory(
      PBJSApplyStateTransitionResponse,
    ),
    checkVersionWrapper(
      wrapInErrorHandler(applyStateTransitionHandler),
    ),
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
    checkVersionWrapper(
      wrapInErrorHandler(getIdentityHandler),
    ),
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
    checkVersionWrapper(
      wrapInErrorHandler(getDocumentsHandler),
    ),
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
    checkVersionWrapper(
      wrapInErrorHandler(getDataContractHandler),
    ),
  );

  return {
    applyStateTransition: wrappedApplyStateTransition,
    getIdentity: wrappedGetIdentity,
    getDocuments: wrappedGetDocuments,
    getDataContract: wrappedGetDataContract,
  };
}

module.exports = platformHandlersFactory;
