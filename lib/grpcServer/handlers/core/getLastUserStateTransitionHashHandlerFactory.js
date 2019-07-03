const { LastUserStateTransitionHashResponse } = require('@dashevo/dapi-grpc');

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
    const { userId: userIdBuffer } = call.request;

    if (!userIdBuffer) {
      throw new InvalidArgumentGrpcError('userId is not specified');
    }

    if (userIdBuffer.length !== 256) {
      throw new InvalidArgumentGrpcError('userId length is not 256 bytes');
    }

    const userId = userIdBuffer.toString('hex');

    const user = await coreAPI.getUser(userId);

    if (!user) {
      throw new InvalidArgumentGrpcError(`User was not found by id ${userId}`);
    }

    const response = new LastUserStateTransitionHashResponse();

    let stateTransitionHash = null;

    if (Array.isArray(user.subtx) && user.subtx.length > 0) {
      stateTransitionHash = Buffer.from(
        user.subtx[user.subtx.length - 1],
        'hex',
      );
    }

    response.setStateTransitionHash(stateTransitionHash);

    return response;
  }

  return getLastStateTransitionHashHandler;
}

module.exports = getLastStateTransitionHashHandlerFactory;
