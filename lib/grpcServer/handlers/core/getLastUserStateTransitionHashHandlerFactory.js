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
    const userId = call.request.getUserId();

    coreAPI.getUser(userId)
      .then((user) => {
        if (!user) {
          const error = new InvalidArgumentError(`User was not found by id ${userId}`);

          callback(error, null);

          return;
        }

        const response = new LastUserStateTransitionHashResponse();

        if (!Array.isArray(user.subtx) || user.subtx.length === 0) {
          response.setRegTxId(userId);
        } else {
          response.setLastStateTransitionHash(user.subtx[user.subtx.length - 1]);
        }

        callback(null, response);
      })
      .catch((e) => {
        throw new Error(e.message);
      });
  }

  return getLastStateTransitionHashHandler;
}

module.exports = getLastStateTransitionHashHandlerFactory;
