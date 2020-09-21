const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    PublicKeyHashIdentityIdPair,
    GetIdentityIdsByPublicKeyHashesResponse,
  },
} = require('@dashevo/dapi-grpc');

const AbciResponseError = require('../../../errors/AbciResponseError');

/**
 *
 * @param {DriveStateRepository} driveStateRepository
 * @param {handleAbciResponseError} handleAbciResponseError
 * @return {getIdentityIdsByPublicKeyHashesHandler}
 */
function getIdentityIdsByPublicKeyHashesHandlerFactory(
  driveStateRepository, handleAbciResponseError,
) {
  /**
   * @typedef getIdentityIdsByPublicKeyHashesHandler
   * @param {Object} call
   * @return {Promise<GetIdentityIdsByPublicKeyHashesResponse>}
   */
  async function getIdentityIdsByPublicKeyHashesHandler(call) {
    const { request } = call;

    const publicKeyHashes = request.getPublicKeyHashes();

    if (publicKeyHashes.length === 0) {
      throw new InvalidArgumentGrpcError('No public key hashes was provided');
    }

    const publicKeyHashBuffers = publicKeyHashes.map(array => Buffer.from(array));

    let publicKeyHashIdentityIdMap;
    try {
      publicKeyHashIdentityIdMap = await driveStateRepository.fetchIdentityIdsByPublicKeyHashes(
        publicKeyHashBuffers,
      );
    } catch (e) {
      if (e instanceof AbciResponseError) {
        handleAbciResponseError(e);
      }
      throw e;
    }

    const publicKeyHashIdentityIdPairs = Object.entries(publicKeyHashIdentityIdMap)
      .map(([publiKeyHash, identityId]) => {
        const pair = new PublicKeyHashIdentityIdPair();
        pair.setPublicKeyHash(publiKeyHash);
        pair.setIdentityId(identityId);
        return pair;
      });

    const response = new GetIdentityIdsByPublicKeyHashesResponse();

    response.setPublicKeyHashIdentityIdPairs(
      publicKeyHashIdentityIdPairs,
    );

    return response;
  }

  return getIdentityIdsByPublicKeyHashesHandler;
}

module.exports = getIdentityIdsByPublicKeyHashesHandlerFactory;
