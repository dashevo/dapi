const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const {
  GetIdentityIdByFirstPublicKeyResponse,
} = require('@dashevo/dapi-grpc');

const AbciResponseError = require('../../../errors/AbciResponseError');

/**
 *
 * @param {DriveStateRepository} driveStateRepository
 * @param {handleAbciResponseError} handleAbciResponseError
 * @return {getIdentityIdByFirstPublicKeyHandler}
 */
function getIdentityIdByFirstPublicKeyHandlerFactory(
  driveStateRepository,
  handleAbciResponseError,
) {
  /**
   *
   * @typedef getIdentityIdByFirstPublicKeyHandler
   * @param {Object} call
   * @return {Promise<GetIdentityByFirstPublicKeyResponse>}
   */
  async function getIdentityIdByFirstPublicKeyHandler(call) {
    const { request } = call;

    const publicKeyHash = request.getPublicKeyHash();

    if (!publicKeyHash) {
      throw new InvalidArgumentGrpcError('Public key hash is not specified');
    }

    let identityId;
    try {
      identityId = await driveStateRepository.fetchIdentityIdByFirstPublicKey(Buffer.from(publicKeyHash).toString('hex'));
    } catch (e) {
      if (e instanceof AbciResponseError) {
        handleAbciResponseError(e);
      }
      throw e;
    }

    const response = new GetIdentityIdByFirstPublicKeyResponse();

    response.setId(identityId.toString());

    return response;
  }

  return getIdentityIdByFirstPublicKeyHandler;
}

module.exports = getIdentityIdByFirstPublicKeyHandlerFactory;
