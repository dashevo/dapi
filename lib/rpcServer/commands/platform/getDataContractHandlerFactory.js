const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');

const RPCError = require('../../../rpcServer/RPCError');

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
    const { id } = args;

    if (id == null) {
      throw new InvalidArgumentGrpcError('id is not specified');
    }

    let dataContractJSON;

    try {
      dataContractJSON = await driveAPI.fetchContract(id);
    } catch (e) {
      if (e instanceof RPCError && e.code === -32602) {
        throw new InvalidArgumentGrpcError(e.message, e.data);
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
