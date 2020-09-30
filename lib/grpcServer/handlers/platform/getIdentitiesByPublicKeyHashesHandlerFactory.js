const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    GetIdentitiesByPublicKeyHashesResponse,
    PublicKeyHashIdentityPair,
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
      throw new InvalidArgumentGrpcError('No public key hashes were provided');
    }

    const publicKeyHashBuffers = publicKeyHashes.map(array => Buffer.from(array));

    let publicKeyHashIdenityMap;
    try {
      publicKeyHashIdenityMap = await driveStateRepository.fetchIdentitiesByPublicKeyHashes(
        publicKeyHashBuffers,
      );
    } catch (e) {
      if (e instanceof AbciResponseError) {
        handleAbciResponseError(e);
      }
      throw e;
    }

    const publicKeyHashIdenityPairs = Object.entries(publicKeyHashIdenityMap)
      .map(([publicKeyHash, identity]) => {
        const pair = new PublicKeyHashIdentityPair();
        pair.setPublicKeyHash(publicKeyHash);
        pair.setIdentity(identity);
        return pair;
      });

    const response = new GetIdentitiesByPublicKeyHashesResponse();

    response.setIdentitiesByPublicKeyHashes(
      publicKeyHashIdenityPairs,
    );

    return response;
  }

  return getIdentitiesByPublicKeyHashesHandler;
}

module.exports = getIdentitiesByPublicKeyHashesHandlerFactory;
