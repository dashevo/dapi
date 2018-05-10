const { TransitionHeader, TransitionPacket } = require('@dashevo/dashcore-lib').StateTransition;
const Schema = require('@dashevo/dash-schema/lib');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/sendRawTransition');

const validator = new Validator(argsSchema);


const { validate } = Schema;

function transformHeader(realHeader, packetId) {
  const ts = Schema.create.tsheader(packetId, realHeader.hashRegTx);
  ts.tsheader.meta = { id: realHeader.tsid };
  return ts;
}

function sendRawTransitionFactory(coreAPI, dashDrive) {
  /**
   * @typedef sendRawTransition
   * @param args
   * @param args.rawTransitionHeader
   * @param [args.rawTransitionPacket]
   * @return {Promise<*>}
   */
  const sendRawTransition = async (args) => {
    validator.validate(args);
    const rawTransitionHeader = args[0] || args.rawTransitionHeader;
    const rawTransitionPacket = args[1] || args.rawTransitionPacket;
    const transitionHeader = new TransitionHeader(rawTransitionHeader);
    let transformedHeader = transformHeader(
      transitionHeader.toObject(),
      '',
    );

    // TODO: WE CAN'T VERIFY SIG DUE TO A BUG IN BITCORE.
    // TODO: *ALL* LIBRARIES THAT DEPENDS ON BITCORE-LIB NEED TO BE UPDATED
    // const regTxHash = transitionHeader.hashRegTx;
    // const user = await insight.getUser(regTxHash);
    // if (!transitionHeader.verifyUserSignature(user.pubkeyid)) {
    //   return callback({ code: 400, message: 'User signature is not valid' });
    // }

    if (transitionHeader.isUpdateTransition()) {
      if (!rawTransitionPacket) {
        throw new Error('Update state requires transition data packet');
      }

      let transitionPacket = new TransitionPacket(rawTransitionPacket);

      // Transform to current dash-schema format. Need to be removed in the future.
      [transitionPacket] = transitionPacket.toObject().objects;
      if (transitionPacket.tspacket.dapobjects) {
        const dapContract = await dashDrive.getDapContract(transitionPacket.tspacket.dapid);
        Schema.object.setID(transitionPacket, dapContract.dapcontract.dapschema);
      } else {
        Schema.object.setID(transitionPacket);
      }
      transformedHeader = transformHeader(
        transitionHeader.toObject(),
        transitionPacket.tspacket.meta.id,
      );

      const headerValidationResult = validate.tsheader(transformedHeader);
      if (!headerValidationResult.valid) {
        throw new Error(`Transition data is not valid: ${headerValidationResult.validateErrors[0]}`);
      }

      const packetValidationResult = validate.tspacket(transitionPacket);
      if (!packetValidationResult.valid) {
        throw new Error(packetValidationResult.validateErrors[0]);
      }

      const packetId = await dashDrive.pinPacket(transformedHeader, transitionPacket);
      if (!packetId) {
        throw new Error('Wasn\'t able to pin packet');
      }
      // Todo: move it out of here in refactor branch
      dashDrive._commitPacket(transformedHeader, {}); // eslint-disable-line no-underscore-dangle
    }

    /*
      It looks like transition id returned from the core is different from what we
      have locally. It's possibly an effect of quorum sigs experiment in the core.
       */
    await coreAPI.sendRawTransition(transitionHeader.serialize());
    // }

    // TODO: Some quorum sig magic should happen here
    // transition.applyQuorumSignature();

    return transformedHeader.tsheader.meta.id;
  };

  return sendRawTransition;
}


module.exports = sendRawTransitionFactory;
