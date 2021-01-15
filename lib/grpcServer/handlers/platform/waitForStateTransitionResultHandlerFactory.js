const {
  server: {
    error: {
      InvalidArgumentGrpcError,
    },
  },
} = require('@dashevo/grpc-common');
const {
  v0: {
    WaitForStateTransitionResultResponse,
    StateTransitionBroadcastError,
    Proof,
  },
} = require('@dashevo/dapi-grpc');

const cbor = require('cbor');

/**
 *
 * @param {DriveStateRepository} driveStateRepository
 * @param {WsClient} tenderDashWsClient
 * @param {DashPlatformProtocol} dpp
 * @return {waitForStateTransitionResultHandler}
 */
function waitForStateTransitionResultHandlerFactory(
  driveStateRepository,
  tenderDashWsClient,
  dpp,
) {
  /**
   *
   * @param {AbstractStateTransition} stateTransition
   * @return {Promise<Object>}
   */
  async function fetchProof(stateTransition) {
    const modifiedIds = stateTransition.getModifiedDataIds();

    let proof;
    const params = {};
    if (stateTransition.isDocumentStateTransition()) {
      ({ documentsProof: proof } = await driveStateRepository.fetchProofs(
        { documentIds: modifiedIds },
      ));
    } else if (stateTransition.isIdentityStateTransition()) {
      ({ identitiesProof: proof } = await driveStateRepository.fetchProofs(
        { identityIds: modifiedIds },
      ));
      params.identityIds = modifiedIds;
    } else if (stateTransition.isDataContractStateTransition()) {
      ({ dataContractsProof: proof } = await driveStateRepository.fetchProofs(
        { dataContractIds: modifiedIds },
      ));
    }

    return proof;
  }


  /**
   * @typedef waitForStateTransitionResultHandler
   * @param {Object} call
   * @return {Promise<WaitForStateTransitionResultResponse>}
   */

  async function waitForStateTransitionResultHandler(call) {
    const { request } = call;

    const stateTransitionHash = request.getStateTransitionHash();
    const prove = request.getProve();

    if (stateTransitionHash === null) {
      throw new InvalidArgumentGrpcError('state transition hash is not specified');
    }

    const query = 'tm.event = \'Tx\'';
    const hashString = Buffer.from(stateTransitionHash).toString('hex').toUpperCase();

    const data = await new Promise((resolve) => {
      tenderDashWsClient.on(query, (message) => {
        if (message.events['tx.hash'].includes(hashString)) {
          resolve(message);
        }
      });
    });

    const response = new WaitForStateTransitionResultResponse();

    const { result, tx } = data.data.value.TxResult;

    if (result && result.code !== undefined && result.code !== 0) {
      const { error: abciError } = JSON.parse(result.log);

      let errorData;
      if (abciError.data) {
        errorData = cbor.encode(abciError.data);
      }

      const error = new StateTransitionBroadcastError();

      error.setCode(result.code);
      error.setMessage(abciError.message);
      error.setData(errorData);

      response.setError(error);

      return response;
    }

    if (prove) {
      const stateTransition = await dpp.stateTransition.createFromBuffer(
        Buffer.from(tx, 'base64'),
        { skipValidation: true },
      );
      const proofObject = await fetchProof(stateTransition);

      const proof = new Proof();
      proof.setRootTreeProof(proofObject.rootTreeProof);
      proof.setStoreTreeProof(proofObject.storeTreeProof);

      response.setProof(proof);
    }

    return response;
  }

  return waitForStateTransitionResultHandler;
}

module.exports = waitForStateTransitionResultHandlerFactory;
