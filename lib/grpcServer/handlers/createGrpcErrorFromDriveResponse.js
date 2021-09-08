const cbor = require('cbor');
const {
  server: {
    error: {
      InternalGrpcError,
      InvalidArgumentGrpcError,
      DeadlineExceededGrpcError,
      ResourceExhaustedGrpcError,
      NotFoundGrpcError,
      FailedPreconditionGrpcError,
      UnavailableGrpcError,
      GrpcError,
    },
  },
} = require('@dashevo/grpc-common');
const GrpcErrorCodes = require('@dashevo/grpc-common/lib/server/error/GrpcErrorCodes');
const createConsensusError = require('@dashevo/dpp/lib/errors/consensus/createConsensusError');
const AlreadyExistsGrpcError = require('@dashevo/grpc-common/lib/server/error/AlreadyExistsGrpcError');

/**
 * @typedef createGrpcErrorFromDriveResponse
 * @param {number} code
 * @param {string} info
 * @return {GrpcError}
 */
function createGrpcErrorFromDriveResponse(code, info) {
  if (code === undefined) {
    return new InternalGrpcError('Drive’s error code is empty');
  }

  const decodedInfo = cbor.decode(Buffer.from(info, 'base64'));

  // eslint-disable-next-line default-case
  switch (code) {
    case GrpcErrorCodes.INVALID_ARGUMENT:
      return new InvalidArgumentGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.DEADLINE_EXCEEDED:
      return new DeadlineExceededGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.NOT_FOUND:
      return new NotFoundGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.ALREADY_EXISTS:
      return new AlreadyExistsGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.RESOURCE_EXHAUSTED:
      return new ResourceExhaustedGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.FAILED_PRECONDITION:
      return new FailedPreconditionGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.INTERNAL:
      return new InternalGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.UNAVAILABLE:
      return new UnavailableGrpcError(decodedInfo.message, decodedInfo.metadata);
    case GrpcErrorCodes.CANCELLED:
    case GrpcErrorCodes.UNKNOWN:
    case GrpcErrorCodes.UNAUTHENTICATED:
    case GrpcErrorCodes.DATA_LOSS:
    case GrpcErrorCodes.UNIMPLEMENTED:
    case GrpcErrorCodes.OUT_OF_RANGE:
    case GrpcErrorCodes.ABORTED:
    case GrpcErrorCodes.PERMISSION_DENIED:
      return new GrpcError(code, decodedInfo.message, decodedInfo.metadata);
  }

  if (code >= 17 && code < 1000) {
    return new GrpcError(code, decodedInfo.message, decodedInfo.metadata);
  }

  if (code >= 1000 && code < 5000) {
    return createConsensusError(code, decodedInfo);
  }

  return new GrpcError(GrpcErrorCodes.INTERNAL, `Unknown Drive’s error code: ${code}`, decodedInfo);
}

module.exports = createGrpcErrorFromDriveResponse;
