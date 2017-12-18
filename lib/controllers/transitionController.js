const { Transition, State } = require('@dashevo/dash-schema/lib').Consensus;
const insight = require('../insight');
const { StateTransition, PublicKey } = require('bitcore-lib-dash');

const transitionController = {
  /**
   * This method should do quorum validation
   * @param {string|object} rawTransition - hex transition
   * @returns {Promise.<string>}
   */
  async sendRawTransition(rawTransition) {
    const transition = new StateTransition(rawTransition);
    if (!Transition.validate(transition.toObject())) {
      throw new Error('Transition data is not valid');
    }

    const regTxHash = transition.hashRegTx;
    const user = insight.getUser(regTxHash);
    const userPublicKey = new PublicKey();
    if (!transition.verifyUserSignature(userPublicKey)) {
      throw new Error('User signature is not valid');
    }
    // TODO: this should be implemented in bitcore
    // if (transition.isFullySignedByQuorum()) {
    // TODO: save data to dash drive
    return insight.sendTransition(transition.serialize());
    // }

    // TODO: this should be implemented in bitcore
    // transition.applyQuorumSignature();

    // TODO: what to return here? We actually need to pass transition to other nodes in quorum
    // return State.getTSID(transition.toObject());
  },
};

module.exports = transitionController;
