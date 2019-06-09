const { LastUserStateTransitionHashResponse } = require('@dashevo/dapi-grpc');

const InvalidArgumentError = require('../../error/InvalidArgumentError');

function getLastStateTransitionHashHandlerFactory(coreAPI) {
  function getLastStateTransitionHashHandler(call, callback) {
    const userId = call.request.getUserId();

    coreAPI.getUser(userId).then((e, user) => {
      if (e) {
        throw new Error(e.message);
      }

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
    });
  }

  return getLastStateTransitionHashHandler;
}

module.exports = getLastStateTransitionHashHandlerFactory;
