const {
  server: {
    error: {
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

    const dataContractJSON = await driveAPI.fetchContract(id);

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
