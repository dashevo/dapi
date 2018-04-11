const log = require('../../log');
const insight = require('../../api/insight');
const { TransitionHeader, TransitionPacket } = require('bitcore-lib-dash').StateTransition;
const { validate } = require('@dashevo/dash-schema/lib');
const { DashDrive } = require('@dashevo/dash-schema/vmn');

// Emulated dd.
const dashDrive = new DashDrive();

const sendRawTransition = async (args, callback) => {
  try {
    const rawTransitionHeader = args[0] || args.transitionHeader;
    const rawTransitionPacket = args[0] || args.transitionPacket;
    if (rawTransitionHeader == null) {
      return callback({ code: 400, message: 'Invalid arguments' });
    }
    const transitionHeader = new TransitionHeader(rawTransitionHeader);
    const transitionPacket = new TransitionPacket(rawTransitionPacket);
    if (!validate.tsheader(transitionHeader.toObject())) {
      return callback({ code: 400, message: 'Transition data is not valid' });
    }

    const regTxHash = transitionHeader.hashRegTx;
    const user = await insight.getUser(regTxHash);
    if (!transitionHeader.verifyUserSignature(user.pubkeyid)) {
      return callback({ code: 400, message: 'User signature is not valid' });
    }

    if (transitionHeader.isUpdateTransition()) {
      if (!rawTransitionPacket) {
        return callback({ code: 400, message: 'Update state requires transition data packet' });
      }
      const packetValidationResult = validate.tspacket(transitionPacket);
      if (!packetValidationResult.valid) {
        return callback({ code: 400, message: packetValidationResult.validateErrors[0] });
      }
      // Todo: verify that it works
      dashDrive.pinPacket(transitionHeader.toObject(), transitionPacket.toObject());
    }
    // TODO: this should be implemented in bitcore
    // if (transition.isFullySignedByQuorum()) {
    const transitionId = insight.sendRawTransition(transitionHeader.serialize());
    // }

    // TODO: this should be implemented in bitcore
    // transition.applyQuorumSignature();

    // TODO: Here quorum stuff should happen

    return callback(null, transitionId);
  } catch (e) {
    log.error(e);
    return callback({ code: 400, e: e.message });
  }
};

module.exports = sendRawTransition;
