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
 * @param {AbstractDriveAdapter} driveAPI
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

    if (!startAfter && !startAt) {
      throw new InvalidArgumentGrpcError('startAfter or startAt is not specified');
    }

    const options = {
      where,
      orderBy,
      limit,
    };

    if (startAfter) {
      options.startAfter = startAfter;
    } else {
      options.startAt = startAt;
    }

    let documents;
    try {
      documents = await driveAPI.fetchDocuments(dataContractId, documentType, options);
    } catch (e) {
      throw new InternalGrpcError(e);
    }

    const response = new GetDocumentsResponse();
    response.setDocuments(cbor.encodeCanonical(documents));

    return response;
  }

  return getDocumentsHandler;
}

module.exports = getDocumentsHandlerFactory;
