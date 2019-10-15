const cbor = require('cbor');
const {
  UpdateStateTransitionResponse,
} = require('@dashevo/dapi-grpc');

const InvalidArgumentGrpcError = require('../../error/InvalidArgumentGrpcError');
const InternalGrpcError = require('../../error/InternalGrpcError');

/**
 *
 * @param {jaysonClient} rpcClient
 * @returns {updateStateHandler}
 */
function updateStateHandlerFactory(rpcClient) {
  /**
   * @typedef updateStateHandler
   * @param {Object} call
   */
  async function updateStateHandler(call) {
    const { request } = call;
    const header = request.getHeader();
    const packet = request.getPacket();

    if (!header) {
      throw new InvalidArgumentGrpcError('header is not specified');
    }

    if (!packet) {
      throw new InvalidArgumentGrpcError('packet is not specified');
    }

    const st = {
      header: Buffer.from(header).toString('hex'),
      packet: Buffer.from(packet),
    };

    const tx = cbor.encode(st).toString('base64');

    let result;
    try {
      // @TODO check for timeout
      result = await rpcClient.request('broadcast_tx_commit', { tx });
    } catch (error) {
      throw new InternalGrpcError(error);
    }

    const { check_tx: checkTx, deliver_tx: deliverTx } = result;

    if (checkTx.code) {
      throw new InvalidArgumentGrpcError(checkTx.log, result);
    }

    if (deliverTx.code) {
      throw new InvalidArgumentGrpcError(deliverTx.log, result);
    }

    return new UpdateStateTransitionResponse();
  }

  return updateStateHandler;
}

module.exports = updateStateHandlerFactory;
