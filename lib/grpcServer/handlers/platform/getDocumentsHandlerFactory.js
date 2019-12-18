const cbor = require('cbor');

const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  GetDocumentsResponse,
} = require('@dashevo/dapi-grpc');

const RPCError = require('../../../rpcServer/RPCError');

/**
 *
 * @param {DriveAdapter} driveAPI
 * @param {DashPlatformProtocol} dpp
 * @returns {getDocumentsHandler}
 */
function getDocumentsHandlerFactory(driveAPI, dpp) {
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

    let documentsJSON;
    try {
      documentsJSON = await driveAPI.fetchDocuments(dataContractId, documentType, options);
    } catch (e) {
      if (e instanceof RPCError && e.code === -32602) {
        throw new InvalidArgumentGrpcError(e.message, e.data);
      }

      throw e;
    }

    const documents = await Promise.all(
      documentsJSON.map(documentJSON => dpp.document.createFromObject(
        documentJSON,
        { skipValidation: true },
      )),
    );

    const response = new GetDocumentsResponse();
    response.setDocumentsList(documents.map(document => document.serialize()));

    return response;
  }

  return getDocumentsHandler;
}

module.exports = getDocumentsHandlerFactory;
