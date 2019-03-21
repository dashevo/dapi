const RPCError = require('./RPCError');
const ArgumentsValidationError = require('../errors/ArgumentsValidationError');

/**
 * Decorates function with an error handler
 * @param {function} command
 * @param {Logger} log
 * @return {function(*=): Promise<T | never>}
 */
function errorHandlerDecorator(command, log) {
  return async function callCommand(args) {
    return command(args)
      .catch((e) => {
        if (e instanceof RPCError) {
          throw e;
        } else if (e instanceof ArgumentsValidationError) {
          throw new RPCError(-32602, e.message);
        }
        log.error(e);
        throw new RPCError(-32602, 'Internal error');
      });
  };
}

module.exports = errorHandlerDecorator;
