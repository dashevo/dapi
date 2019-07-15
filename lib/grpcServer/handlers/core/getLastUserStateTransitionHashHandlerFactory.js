const {
  LastUserStateTransitionHashResponse,
} = require('@dashevo/dapi-grpc');

const InvalidArgumentGrpcError = require('../../error/InvalidArgumentGrpcError');

/**
 * @param {RpcClient} coreAPI
 * @returns {getLastStateTransitionHashHandler}
 */
function getLastStateTransitionHashHandlerFactory(coreAPI) {
  /**
   * @typedef getLastStateTransitionHashHandler
   * @param {Object} call
   */
  async function getLastStateTransitionHashHandler(call) {
    const { request } = call;

    const userIdBuffer = request.getUserId();

    if (!userIdBuffer) {
      throw new InvalidArgumentGrpcError('userId is not specified');
    }

    if (userIdBuffer.length !== 256) {
      throw new InvalidArgumentGrpcError('userId length is not 256 bytes');
    }

    const userId = userIdBuffer.toString('hex');

    let user;
    try {
      user = await coreAPI.getUser(userId);
    } catch (e) {
      throw new InvalidArgumentGrpcError(`Could not retrieve user by id ${userId}. Reason: ${e.message}`);
    }

    const response = new LastUserStateTransitionHashResponse();

    if (Array.isArray(user.subtx) && user.subtx.length > 0) {
      const stateTransitionHash = Buffer.from(
        user.subtx[user.subtx.length - 1],
        'hex',
      );

      response.setStateTransitionHash(stateTransitionHash);
    }

    return response;
  }

  return getLastStateTransitionHashHandler;
}

module.exports = getLastStateTransitionHashHandlerFactory;
