const bs58 = require('bs58');

const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  v0: {
    GetIdentityIdByFirstPublicKeyResponse,
  },
} = require('@dashevo/dapi-grpc');

const AbciResponseError = require('../../../errors/AbciResponseError');

/**
 *
 * @param {DriveStateRepository} driveStateRepository
 * @param {handleAbciResponseError} handleAbciResponseError
 * @return {getIdentityIdByPublicKeyHashHandler}
 */
function getIdentityIdByPublicKeyHashHandlerFactory(
  driveStateRepository,
  handleAbciResponseError,
) {
  /**
   *
   * @typedef getIdentityIdByPublicKeyHashHandler
   * @param {Object} call
   * @return {Promise<GetIdentityByFirstPublicKeyResponse>}
   */
  async function getIdentityIdByPublicKeyHashHandler(call) {
    const { request } = call;

    const publicKeyHash = request.getPublicKeyHash();

    if (!publicKeyHash) {
      throw new InvalidArgumentGrpcError('Public key hash is not specified');
    }

    const publicKeyHashString = Buffer.from(publicKeyHash).toString('hex');

    let identityId;
    try {
      identityId = await driveStateRepository.fetchIdentityIdByFirstPublicKey(publicKeyHashString);
    } catch (e) {
      if (e instanceof AbciResponseError) {
        handleAbciResponseError(e);
      }
      throw e;
    }

    const response = new GetIdentityIdByFirstPublicKeyResponse();

    response.setId(bs58.encode(identityId));

    return response;
  }

  return getIdentityIdByPublicKeyHashHandler;
}

module.exports = getIdentityIdByPublicKeyHashHandlerFactory;
