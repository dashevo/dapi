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
   * @param {Object} args
   * @param {Object} args.contractId
   * @param {Object} args.documentType
   * @param {Object} args.where
   * @param {Object} args.orderBy
   * @param {Object} args.limit
   * @param {Object} args.startAfter
   * @param {Object} args.startAt
   * @returns {Promise<GetDocumentsResponse>}
   */
  async function getDocumentsHandler(args) {
    let {
      dataContractId, documentType, where, orderBy, limit, startAfter, startAt,
    } = args;
    // TODO: where should be binary(?) at this point
    const limitDefault = 0;
    const startAfterDefault = 0;
    const startAtDefault = 0;


    if (!dataContractId) {
      throw new InvalidArgumentGrpcError('dataContractId is not specified');
    }

    if (!documentType) {
      throw new InvalidArgumentGrpcError('documentType is not specified');
    }

    if (!limit) {
      limit = limitDefault;
    }

    // Start after

    if (!startAfter) {
      startAfter = startAfterDefault;
    }

    // Start at

    if (!startAt) {
      startAt = startAtDefault;
    }

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
