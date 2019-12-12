const cbor = require('cbor');

const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  GetDataContractResponse,
} = require('@dashevo/dapi-grpc');

/**
 *
 * @param {DriveAdapter} driveAPI
 * @returns {getDataContractHandler}
 */
function getDataContractHandlerFactory(driveAPI) {
  /**
   * @typedef getDataContractHandler
   * @param {Object} call
   * @returns {Promise<GetDocumentsResponse>}
   */
  async function getDataContractHandler(call) {
    const { request } = call;
    const id = request.getId();

    if (id === null) {
      throw new InvalidArgumentGrpcError('id is not specified');
    }

    let dataContract;

    try {
      dataContract = await driveAPI.fetchContract(id);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new GetDataContractResponse();
    response.setDataContract(cbor.encodeCanonical(dataContract));

    return response;
  }

  return getDataContractHandler;
}

module.exports = getDataContractHandlerFactory;
