const { Transaction } = require('@dashevo/dashcore-lib');
const Schema = require('@dashevo/dash-schema/dash-schema-lib');
const crypto = require('crypto');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/sendRawTransition');

const validator = new Validator(argsSchema);
const hash = crypto.createHash('sha256');

const createStateTransition =
  ({
    TransactionClass = Transaction,
    SchemaClass = Schema,
    rawTransitionHeader,
    rawTransitionDataPacket,
  }) => {
    if (!rawTransitionDataPacket) {
      throw new Error('Updating state requires a transition data packet');
    }

    const packet = Schema.serialize.decode(Buffer.from(rawTransitionDataPacket, 'hex'));

    const packetValidationResult = SchemaClass.validate.stpacket(packet);
    if (!packetValidationResult.valid) {
      throw new Error(`Invalid packet: ${packetValidationResult.errMsg}`);
    }

    const packetHash = hash.update(rawTransitionDataPacket).digest('hex');
    // TODO: The following function is bugged and should be reported to Andy
    // const packetHash = SchemaClass.hash.stpacket(packet);
    const headerTransaction = new TransactionClass(rawTransitionHeader);
    const headerTransactionHash = headerTransaction.extraPayload.hashSTPacket;

    if (packetHash !== headerTransactionHash) {
      throw new Error('The hash of the data packet doesn\'t match the hash present in the header');
    }

    const stateTransition = {
      headerTransaction,
      packet,
    };

    return stateTransition;
  };

// TODO: Implement the following when DashDrive integration is undertaken
const pinAndCommitPacketToDrive = async () => {};

/**
 * @param coreAPI
 * @param dashDrive
 * @return {function({rawTransitionHeader, rawTransitionPacket?}): string}
 */
function sendRawTransitionFactory(coreAPI, dashDrive) {
  /**
   * @typedef sendRawTransition
   * @param args
   * @param args.rawTransitionHeader
   * @param [args.rawTransitionPacket]
   * @return {Promise<string>}
   */
  const sendRawTransition = async (args) => {
    validator.validate(args);
    const { rawTransitionHeader, rawTransitionPacket: rawTransitionDataPacket } = args;
    const { headerTransaction: stateTransitionHeader, packet: stateTransitionPacket } =
        createStateTransition({ rawTransitionHeader, rawTransitionDataPacket });
    await pinAndCommitPacketToDrive({ dashDrive, stateTransitionPacket });
    const txid = await coreAPI.sendRawTransaction(stateTransitionHeader.serialize());
    return txid;
  };

  return sendRawTransition;
}

sendRawTransitionFactory.createStateTransition = createStateTransition;
module.exports = sendRawTransitionFactory;
