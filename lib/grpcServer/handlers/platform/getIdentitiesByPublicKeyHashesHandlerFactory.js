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

    const identities = publicKeyHashBuffers
      .map((publicKeyHashBuffer) => {
        const identity = publicKeyHashIdenityMap[publicKeyHashBuffer.toString('hex')];

        if (!identity) {
          return Buffer.alloc(0);
        }

        return identity;
      });

    const response = new GetIdentitiesByPublicKeyHashesResponse();

    response.setIdentitiesList(
      identities,
    );

    return response;
  }

  return getIdentitiesByPublicKeyHashesHandler;
}

module.exports = getIdentitiesByPublicKeyHashesHandlerFactory;
