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
  GetDocumentsResponse,
} = require('@dashevo/dapi-grpc');

/**
 *
 * @param {DriveAdapter} driveAPI
 * @returns {getDocumentsHandler}
 */
function getDocumentsHandlerFactory(driveAPI) {
  /**
   * @typedef getDocumentsHandler
   * @param {Object} call
   * @returns {Promise<GetDocumentsResponse>}
   */
  async function getDocumentsHandler(call) {
    const { request } = call;

    const dataContractId = request.getDataContractId();

    if (!dataContractId) {
      throw new InvalidArgumentGrpcError('dataContractId is not specified');
    }

    const documentType = request.getDocumentType();

    if (!documentType) {
      throw new InvalidArgumentGrpcError('documentType is not specified');
    }

    const whereBinary = request.getWhere();

    let where;
    if (whereBinary) {
      where = cbor.decode(whereBinary);
    }

    const orderByBinary = request.getOrderBy();

    let orderBy;
    if (orderByBinary) {
      orderBy = cbor.decode(orderByBinary);
    }

    const limit = request.getLimit();

    const startAfter = request.getStartAfter();
    const startAt = request.getStartAt();

    const options = {
      where,
      orderBy,
      limit,
      startAfter,
      startAt,
    };

    let documents;
    try {
      documents = await driveAPI.fetchDocuments(dataContractId, documentType, options);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new GetDocumentsResponse();
    response.setDocumentsList(documents.map(document => cbor.encodeCanonical(document)));

    return response;
  }

  return getDocumentsHandler;
}

module.exports = getDocumentsHandlerFactory;
