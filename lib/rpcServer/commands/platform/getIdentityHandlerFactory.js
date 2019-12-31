const bs58 = require('bs58');
const Validator = require('../../../utils/Validator');
const argsSchema = require('./schemas/getIdentity');

const validator = new Validator(argsSchema);

/**
 *
 * @param {jaysonClient} rpcClient
 * @param {handleAbciResponse} handleAbciResponse
 * @returns {getIdentityHandler}
 */
function getIdentityHandlerFactory(rpcClient, handleAbciResponse) {
  /**
   * @typedef getIdentityHandler
   * @param {Object} args
   */
  async function getIdentityHandler(args) {
    validator.validate(args);
    const { id } = args;

    const path = '/identity';

    const data = bs58.decode(id).toString('hex');

    const { result, error: errorMessage } = await rpcClient.request('abci_query', { path, data });

    if (errorMessage) {
      throw new Error(errorMessage);
    }

    handleAbciResponse(result.response);

    const { response: { value: identityBase64 } } = result;

    return { identity: identityBase64 };
  }

  return getIdentityHandler;
}

module.exports = getIdentityHandlerFactory;
