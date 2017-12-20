const log = require('../../log');
const insight = require('../../insight');
const { StateTransition } = require('bitcore-lib-dash');
const { Transition } = require('@dashevo/dash-schema/lib').Consensus;

const sendRawTransition = async function sendTransition(args, callback) {
  const rawTransition = args[0] || args.rawTransition;
  if (rawTransition == null) {
    return callback({ code: 400, message: 'Invalid arguments' });
  }
  try {
    const transition = new StateTransition(rawTransition);
    if (!Transition.validate(transition.toObject())) {
      return callback({ code: 400, message: 'Transition data is not valid' });
    }

    const regTxHash = transition.hashRegTx;
    const user = await insight.getUser(regTxHash);
    if (!transition.verifyUserSignature(user.pubkeyid)) {
      return callback({ code: 400, message: 'User signature is not valid' });
    }
    // TODO: this should be implemented in bitcore
    // if (transition.isFullySignedByQuorum()) {
    // TODO: save data to dash drive
    const transitionId = insight.sendRawTransition(transition.serialize());
    // }

    // TODO: this should be implemented in bitcore
    // transition.applyQuorumSignature();

    // TODO: what to return here? We actually need to pass transition to other nodes in quorum
    // return State.getTSID(transition.toObject());
    return callback(null, transitionId);
  } catch (e) {
    log.error(e);
    return callback({ code: 400, e: e.message });
  }
};

module.exports = sendRawTransition;
