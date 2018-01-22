// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const log = require('../../log');
const insight = require('../../api/insight');
const { StateTransition } = require('bitcore-lib-dash');
const { State } = require('@dashevo/dash-schema/lib').Consensus;

// Emulated dd
const dashDrive = {
  pin(packet) {
    return packet;
  },
};

const sendRawTransition = async function sendTransition(args, callback) {
  const rawTransition = args[0] || args.rawTransition;
  const transitionPacket = args[0] || args.transitionPacket;
  if (rawTransition == null) {
    return callback({ code: 400, message: 'Invalid arguments' });
  }
  try {
    const transition = new StateTransition(rawTransition);
    if (!State.validateTransition(transition.toObject())) {
      return callback({ code: 400, message: 'Transition data is not valid' });
    }

    const regTxHash = transition.hashRegTx;
    const user = await insight.getUser(regTxHash);
    if (!transition.verifyUserSignature(user.pubkeyid)) {
      return callback({ code: 400, message: 'User signature is not valid' });
    }

    if (transition.isUpdateTransition()) {
      if (!transitionPacket) {
        return callback({ code: 400, message: 'Update state requires transition data packet' });
      }
      const packetValidationResult = State.validatePacket(transitionPacket);
      if (!packetValidationResult.valid) {
        return callback({ code: 400, message: packetValidationResult.validateErrors[0] });
      }
      dashDrive.pin(transitionPacket);
    }
    // TODO: this should be implemented in bitcore
    // if (transition.isFullySignedByQuorum()) {
    const transitionId = insight.sendRawTransition(transition.serialize());
    // }

    // TODO: this should be implemented in bitcore
    // transition.applyQuorumSignature();

    // TODO: what to return here? We actually need to pass transition to other nodes in quorum
    return callback(null, transitionId);
  } catch (e) {
    log.error(e);
    return callback({ code: 400, e: e.message });
  }
};

module.exports = sendRawTransition;
