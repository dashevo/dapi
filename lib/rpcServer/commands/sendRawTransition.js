const { Transaction } = require('@dashevo/dashcore-lib');
const Schema = require('@dashevo/dash-schema/lib');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/sendRawTransition');

const validator = new Validator(argsSchema);
const { validate } = Schema;

const transformHeader = (realHeader, packetId) => {
  const ts = Schema.create.tsheader(packetId, realHeader.hashRegTx);
  ts.tsheader.meta = { id: realHeader.tsid };
  return ts;
};

const createStateTransitionHeader =
  ({
    TransactionClass = Transaction, schemaValidate = validate, rawTransitionHeader, packetHash, userId, privateKey,
  }) => {
    const header = new TransactionClass();
    header.setType(TransactionClass.TYPES.SUBTX_TRANSITION);
    const stateTransitionHeader =
      header.extraPayload.setHashSTPacket(packetHash).setRegTxId(userId).sign(privateKey);

    const headerValidationResult = schemaValidate.tsheader(transformHeader(stateTransitionHeader));
    if (!headerValidationResult.valid) {
      throw new Error(`Transition data is not valid: ${headerValidationResult.validateErrors[0]}`);
    }

    return stateTransitionHeader;
  };

const createStateTransitionTransaction =
  ({
    TransactionClass = Transaction, SchemaClass = Schema, rawTransitionHeader, rawTransitionPacket,
  }) => {
    if (!rawTransitionPacket) {
      throw new Error('Updating state requires a transition data packet');
    }
    const packet = Schema.createPacket(rawTransitionPacket);
    const packetHash = SchemaClass.hash(packet);
    const headerTransaction = createStateTransitionHeader({ rawTransitionHeader, packetHash });

    const packetValidationResult = validate.tspacket(packet);
    if (!packetValidationResult.valid) {
      throw new Error(packetValidationResult.validateErrors[0]);
    }
  };

const deepClone = object => JSON.parse(JSON.stringify(object));

const getSchemaObjectID = (transitionPacket, dapSchema, SchemaClass = Schema) => {
  const newTransitionPacket = deepClone(transitionPacket);
  if (newTransitionPacket.tspacket.dapobjects) {
    SchemaClass.object.setID(newTransitionPacket, dapSchema);
    return newTransitionPacket;
  }
  return newTransitionPacket;
};

const pinAndCommitPacketToDrive = async ({ dashDrive, transitionHeader, transitionPacket }) => {
  const { pinPacket, _commitPacket: commitPacket, getDapContract } = dashDrive;
  const transitionPacketObject = transitionPacket.toObject().objects;
  let newTransitionPacketObject = deepClone(transitionPacketObject);
  if (transitionPacketObject.tspacket.dapobjects) {
    const dapContract = await getDapContract(transitionPacketObject.tspacket.dapid);
    newTransitionPacketObject =
      getSchemaObjectID(transitionPacketObject, dapContract.dapcontract.dapschema);
  }
  const transformedHeader =
    transformHeader(transitionHeader.toObject(), newTransitionPacketObject.tspacket.meta.id);
  const packetId = await pinPacket(transformedHeader, transitionPacket);
  if (!packetId) {
    throw new Error('Wasn\'t able to pin packet');
  }
  commitPacket(transformedHeader, {});
  return transformedHeader;
};

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
    const { rawTransitionHeader, rawTransitionPacket } = args;
    const transitionPacket =
        createStateTransitionTransaction({ rawTransitionHeader, rawTransitionPacket });
    // TODO: Wasn't clear on where to get userID and privateKey from
    const userId = '';
    const privateKey = '';
    const transitionHeader =
      createStateTransitionHeader({ rawTransitionHeader, privateKey, userId });
    const transformedHeader =
      await pinAndCommitPacketToDrive({ dashDrive, transitionHeader, transitionPacket });

    // It looks like transition id returned from the core is different from what we
    // have locally. It's possibly an effect of quorum sigs experiment in the core.
    await coreAPI.sendRawTransition(transitionHeader.serialize());
    return transformedHeader.tsheader.meta.id;
  };

  return sendRawTransition;
}

module.exports = sendRawTransitionFactory;
