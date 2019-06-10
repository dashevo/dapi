const { LastUserStateTransitionHashResponse } = require('@dashevo/dapi-grpc');

const InvalidArgumentError = require('../../error/InvalidArgumentError');

/**
 * @param {RpcClient} coreAPI
 * @returns {getLastStateTransitionHashHandler}
 */
function getLastStateTransitionHashHandlerFactory(coreAPI) {
  /**
   * @typedef getLastStateTransitionHashHandler
   * @param {Object} call
   * @param {function(Error, Object)} callback
   */
  function getLastStateTransitionHashHandler(call, callback) {
    const { userId: userIdBuffer } = call.request;

    if (!Buffer.isBuffer(userIdBuffer)) {
      const error = new InvalidArgumentError('userId is not a buffer');

      callback(error, null);

      return;
    }

    if (userIdBuffer.length !== 256) {
      const error = new InvalidArgumentError('userId length is not 256 bytes');

      callback(error, null);

      return;
    }

    const userId = userIdBuffer.toString('hex');

    coreAPI.getUser(userId)
      .then((user) => {
        if (!user) {
          const error = new InvalidArgumentError(`User was not found by id ${userId}`);

          callback(error, null);

          return;
        }

        const response = new LastUserStateTransitionHashResponse();

        let stateTransitionHash = null;

        if (Array.isArray(user.subtx) && user.subtx.length > 0) {
          stateTransitionHash = Buffer.from(
            user.subtx[user.subtx.length - 1],
            'hex',
          );
        }

        response.setLastStateTransitionHash(stateTransitionHash);

        callback(null, response);
      })
      .catch((e) => {
        throw new Error(e.message);
      });
  }

  return getLastStateTransitionHashHandler;
}

module.exports = getLastStateTransitionHashHandlerFactory;
