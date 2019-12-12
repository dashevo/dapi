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
  ApplyStateTransitionRequest,
  GetIdentityRequest,
  // GetDataContractRequest,
  // GetDocumentsRequest,
  pbjs: {
    ApplyStateTransitionRequest: PBJSApplyStateTransitionRequest,
    ApplyStateTransitionResponse: PBJSApplyStateTransitionResponse,
    GetIdentityRequest: PBJSGetIdentityRequest,
    GetIdentityResponse: PBJSGetIdentityResponse,
    // GetDataContractRequest: PBJSGetDataContractRequest,
    // GetDataContractResponse: PBJSGetDataContractResponse,
    // GetDocumentsRequest: PBJSGetDocumentsRequest,
    // GetDocumentsResponse: PBJSGetDocumentsResponse,
  },
} = require('@dashevo/dapi-grpc');

const log = require('../../../log');
const handleAbciResponse = require('../handleAbciResponse');
const getIdentityHandlerFactory = require(
  './getIdentityHandlerFactory',
);
const applyStateTransitionHandlerFactory = require(
  './applyStateTransitionHandlerFactory',
);

/**
 * @param {jaysonClient} rpcClient
 * @returns {Object<string, function>}
 */
function platformHandlersFactory(rpcClient) {
  const wrapInErrorHandler = wrapInErrorHandlerFactory(log);

  const applyStateTransitionHandler = applyStateTransitionHandlerFactory(
    rpcClient,
    handleAbciResponse,
  );

  const wrappedApplyStateTransition = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      ApplyStateTransitionRequest,
      PBJSApplyStateTransitionRequest,
    ),
    protobufToJsonFactory(
      PBJSApplyStateTransitionResponse,
    ),
    wrapInErrorHandler(applyStateTransitionHandler),
  );

  const fetchIdentityHandler = getIdentityHandlerFactory(rpcClient, handleAbciResponse);

  const wrappedGetIdentity = jsonToProtobufHandlerWrapper(
    jsonToProtobufFactory(
      GetIdentityRequest,
      PBJSGetIdentityRequest,
    ),
    protobufToJsonFactory(
      PBJSGetIdentityResponse,
    ),
    wrapInErrorHandler(fetchIdentityHandler),
  );

  return {
    applyStateTransition: wrappedApplyStateTransition,
    getIdentity: wrappedGetIdentity,
  };
}

module.exports = platformHandlersFactory;
