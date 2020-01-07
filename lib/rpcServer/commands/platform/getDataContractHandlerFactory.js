const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const RPCError = require('../../../rpcServer/RPCError');
const Validator = require('../../../utils/Validator');
const argsSchema = require('./schemas/getDataContract');
const ValidationError = require('../../../errors/ArgumentsValidationError');

const validator = new Validator(argsSchema);

/**
 *
 * @param {DriveAdapter} driveAPI
 * @param {DashPlatformProtocol} dpp
 * @returns {getDataContractHandler}
 */
function getDataContractHandlerFactory(driveAPI, dpp) {
  /**
   * @typedef getDataContractHandler
   * @param {Object} args
   * @param {string} args.id - contract id
   * @returns {Promise<{ dataContract: string }>}
   */
  async function getDataContractHandler(args) {
    validator.validate(args);
    const { id } = args;

    if (id == null) {
      throw new InvalidArgumentGrpcError('id is not specified');
    }

    let dataContractJSON;

    try {
      dataContractJSON = await driveAPI.fetchContract(id);
    } catch (e) {
      if (e instanceof RPCError && e.code === -32602) {
        throw new ValidationError(e.message);
      }

      throw e;
    }

    const dataContract = dpp.dataContract.createFromObject(
      dataContractJSON,
      { skipValidation: true },
    );

    return { dataContract: dataContract.serialize().toString('base64') };
  }

  return getDataContractHandler;
}

module.exports = getDataContractHandlerFactory;
