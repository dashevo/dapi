const { TransitionHeader, TransitionPacket } = require('@dashevo/dashcore-lib').StateTransition;
const { validate } = require('@dashevo/dash-schema/lib');
const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/sendRawTransition');

const argumentsValidator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @param dashDrive
 * @returns {sendRawTransition}
 */
const sendRawTransitionFactory = (coreAPI, dashDrive) => {
  /**
   * Sends raw state transition to the network
   * @typedef sendRawTransition
   * @param args
   * @param {string} args.rawTransitionHeader - hex-encoded transition header
   * @param {string} [args.rawTransitionPacket] - hex-encoded transition packet
   * @returns {Promise<string>} - transition header id
   */
  async function sendRawTransition(args) {
    argumentsValidator.validate(args);
    const rawTransitionHeader = args[0] || args.rawTransitionHeader;
    const rawTransitionPacket = args[1] || args.rawTransitionPacket;
    const transitionHeader = new TransitionHeader(rawTransitionHeader);
    const transitionPacket = new TransitionPacket(rawTransitionPacket);
    if (!validate.tsheader(transitionHeader.toObject())) {
      throw new Error('Transition header is not valid');
    }

    const regTxHash = transitionHeader.hashRegTx;
    const user = await coreAPI.getUser(regTxHash);
    if (!transitionHeader.verifyUserSignature(user.pubkeyid)) {
      throw new Error('User signature is not valid');
    }

    if (transitionHeader.isUpdateTransition()) {
      if (!rawTransitionPacket) {
        throw new Error('Update state requires transition data packet');
      }
      const packetValidationResult = validate.tspacket(transitionPacket);
      if (!packetValidationResult.valid) {
        throw new Error(packetValidationResult.validateErrors[0]);
      }
      // Todo: verify that it works
      dashDrive.pinPacket(transitionHeader.toObject(), transitionPacket.toObject());
    }
    // TODO: this should be implemented in bitcore
    // if (transition.isFullySignedByQuorum()) {
    const transitionId = coreAPI.sendRawTransition(transitionHeader.serialize());
    // }

    // TODO: this should be implemented in bitcore
    // transition.applyQuorumSignature();

    // TODO: Here quorum stuff should happen

    return transitionId;
  }
  return sendRawTransition;
};

module.exports = sendRawTransitionFactory;
