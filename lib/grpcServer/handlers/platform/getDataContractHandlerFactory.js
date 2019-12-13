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
 * @param {DashPlatformProtocol} dpp
 * @returns {getDataContractHandler}
 */
function getDataContractHandlerFactory(driveAPI, dpp) {
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

    let dataContractJSON;

    try {
      dataContractJSON = await driveAPI.fetchContract(id);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const dataContract = dpp.dataContract.createFromObject(
      dataContractJSON,
      { skipValidation: true },
    );

    const response = new GetDataContractResponse();
    response.setDataContract(dataContract.serialize());

    return response;
  }

  return getDataContractHandler;
}

module.exports = getDataContractHandlerFactory;
