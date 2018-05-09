const log = require('../../log');
const coreAPI = require('../../api/dashcore').rpc;
const { TransitionHeader, TransitionPacket } = require('@dashevo/dashcore-lib').StateTransition;
const { DashDrive } = require('@dashevo/dash-schema/vmn');
const Schema = require('@dashevo/dash-schema/lib');

const { validate } = Schema;

function transformHeader(realHeader, packetId, userId) {
  const ts = Schema.create.tsheader(packetId, userId);
  ts.tsheader.meta = { id: realHeader.tsid };
  return ts;
}

// Emulated dd.
const dashDrive = new DashDrive();

const sendRawTransition = async (args, callback) => {
  try {
    const rawTransitionHeader = args[0] || args.transitionHeader;
    const rawTransitionPacket = args[1] || args.transitionPacket;
    if (rawTransitionHeader == null) {
      return callback({ code: 400, message: 'Invalid arguments' });
    }
    const transitionHeader = new TransitionHeader(rawTransitionHeader);
    let transitionPacket = new TransitionPacket(rawTransitionPacket);

    // Transform to current dash-schema format. Need to be removed in the future.
    [transitionPacket] = transitionPacket.toObject().objects;
    if (transitionPacket.tspacket.dapobjects) {
      const dapContract = await dashDrive.getDapContract(transitionPacket.tspacket.dapid);
      Schema.object.setID(transitionPacket, dapContract.dapcontract.dapschema);
    } else {
      Schema.object.setID(transitionPacket);
    }
    const transformedHeader = transformHeader(
      transitionHeader.toObject(),
      transitionPacket.tspacket.meta.id,
      transitionHeader.toObject().hashRegTx,
    );

    const headerValidationResult = validate.tsheader(transformedHeader);
    if (!headerValidationResult.valid) {
      return callback({ code: 400, message: `Transition data is not valid: ${headerValidationResult.validateErrors[0]}` });
    }

    // TODO: WE CAN'T VERIFY SIG DUE TO A BUG IN BITCORE.
    // TODO: *ALL* LIBRARIES THAT DEPENDS ON BITCORE-LIB NEED TO BE UPDATED
    // const regTxHash = transitionHeader.hashRegTx;
    // const user = await insight.getUser(regTxHash);
    // if (!transitionHeader.verifyUserSignature(user.pubkeyid)) {
    //   return callback({ code: 400, message: 'User signature is not valid' });
    // }

    if (transitionHeader.isUpdateTransition()) {
      if (!rawTransitionPacket) {
        return callback({ code: 400, message: 'Update state requires transition data packet' });
      }
      const packetValidationResult = validate.tspacket(transitionPacket);
      if (!packetValidationResult.valid) {
        return callback({ code: 400, message: packetValidationResult.validateErrors[0] });
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

    return callback(null, transformedHeader.tsheader.meta.id);
  } catch (e) {
    log.error(e);
    return callback({ code: 400, message: e.message });
  }
};

module.exports = sendRawTransition;
