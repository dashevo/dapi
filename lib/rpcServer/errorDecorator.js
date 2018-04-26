const RPCError = require('./RPCError');

function errorDecorator(command) {
  return function (args) {
    try {
      return command(args);
    } catch (e) {
      throw new RPCError(400, e.message);
    }
  };
}

module.exports = errorDecorator;
