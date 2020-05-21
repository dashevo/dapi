const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  GetIdentityByFirstPublicKeyResponse,
} = require('@dashevo/dapi-grpc');

const AbciResponseError = require('../../../errors/AbciResponseError');

/**
 *
 * @param {DriveStateRepository} driveStateRepository
 * @param {handleAbciResponseError} handleAbciResponseError
 * @return {getIdentityByFirstPublicKeyHandler}
 */
function getIdentityByFirstPublicKeyHandlerFactory(driveStateRepository, handleAbciResponseError) {
  /**
   * @typedef getIdentityByFirstPublicKeyHandler
   * @param {Object} call
   * @return {Promise<GetIdentityByFirstPublicKeyResponse>}
   */
  async function getIdentityByFirstPublicKeyHandler(call) {
    const { request } = call;

    const publicKeyHash = request.getPublicKeyHash();

    if (!publicKeyHash) {
      throw new InvalidArgumentGrpcError('Public key hash is not specified');
    }

    let identityBuffer;
    try {
      identityBuffer = await driveStateRepository.fetchIdentityByFirstPublicKey(Buffer.from(publicKeyHash).toString('hex'));
    } catch (e) {
      if (e instanceof AbciResponseError) {
        handleAbciResponseError(e);
      }
      throw e;
    }

    const response = new GetIdentityByFirstPublicKeyResponse();

    response.setIdentity(identityBuffer);

    return response;
  }

  return getIdentityByFirstPublicKeyHandler;
}

module.exports = getIdentityByFirstPublicKeyHandlerFactory;
