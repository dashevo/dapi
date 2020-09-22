const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    PublicKeyHashIdentityPair,
    GetIdentitiesByPublicKeyHashesResponse,
  },
} = require('@dashevo/dapi-grpc');

const AbciResponseError = require('../../../errors/AbciResponseError');

/**
 *
 * @param {DriveStateRepository} driveStateRepository
 * @param {handleAbciResponseError} handleAbciResponseError
 * @return {getIdentitiesByPublicKeyHashesHandler}
 */
function getIdentitiesByPublicKeyHashesHandlerFactory(
  driveStateRepository, handleAbciResponseError,
) {
  /**
   * @typedef getIdentitiesByPublicKeyHashesHandler
   * @param {Object} call
   * @return {Promise<GetIdentitiesByPublicKeyHashesResponse>}
   */
  async function getIdentitiesByPublicKeyHashesHandler(call) {
    const { request } = call;

    const publicKeyHashes = request.getPublicKeyHashes();

    if (publicKeyHashes.length === 0) {
      throw new InvalidArgumentGrpcError('No public key hashes was provided');
    }

    const publicKeyHashBuffers = publicKeyHashes.map(array => Buffer.from(array));

    let identities;
    try {
      identities = await driveStateRepository.fetchIdentitiesByPublicKeyHashes(
        publicKeyHashBuffers,
      );
    } catch (e) {
      if (e instanceof AbciResponseError) {
        handleAbciResponseError(e);
      }
      throw e;
    }

    const response = new GetIdentitiesByPublicKeyHashesResponse();

    response.setIdentities(
      identities,
    );

    return response;
  }

  return getIdentitiesByPublicKeyHashesHandler;
}

module.exports = getIdentitiesByPublicKeyHashesHandlerFactory;
