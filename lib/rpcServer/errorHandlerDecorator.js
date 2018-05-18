const RPCError = require('./RPCError');

function errorHandlerDecorator(command) {
  return function callCommand(args) {
    try {
      return command(args);
    } catch (e) {
      throw new RPCError(-32602, e.message);
    }
  };
}

module.exports = errorHandlerDecorator;
