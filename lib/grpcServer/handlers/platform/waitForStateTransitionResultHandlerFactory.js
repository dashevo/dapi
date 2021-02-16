const {
  server: {
    error: {
      InvalidArgumentGrpcError,
      DeadlineExceededGrpcError,
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
const TransactionWaitPeriodExceededError = require('../../../errors/TransactionWaitPeriodExceededError');

/**
 *
 * @param {DriveClient} driveClient
 * @param {BlockchainListener} blockchainListener
 * @param {DashPlatformProtocol} dpp
 * @param {number} stateTransitionWaitTimeout
 * @return {waitForStateTransitionResultHandler}
 */
function waitForStateTransitionResultHandlerFactory(
  driveClient,
  blockchainListener,
  dpp,
  stateTransitionWaitTimeout = 80000,
) {
  /**
   *
   * @param {AbstractStateTransition} stateTransition
   * @return {Promise<Object>}
   */
  async function fetchProof(stateTransition) {
    const modifiedIds = stateTransition.getModifiedDataIds();

    let proof;
    if (stateTransition.isDocumentStateTransition()) {
      ({ documentsProof: proof } = await driveClient.fetchProofs(
        { documentIds: modifiedIds },
      ));
    } else if (stateTransition.isIdentityStateTransition()) {
      ({ identitiesProof: proof } = await driveClient.fetchProofs(
        { identityIds: modifiedIds },
      ));
    } else if (stateTransition.isDataContractStateTransition()) {
      ({ dataContractsProof: proof } = await driveClient.fetchProofs(
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

    if (!stateTransitionHash) {
      throw new InvalidArgumentGrpcError('state transition hash is not specified');
    }

    const hashString = Buffer.from(stateTransitionHash).toString('hex').toUpperCase();
    let data;

    console.log(`[${new Date()}]: waiting for ST ${hashString}`);
    try {
      data = await blockchainListener
        .waitForTransactionToBeProvable(hashString, stateTransitionWaitTimeout);
    } catch (e) {
      if (e instanceof TransactionWaitPeriodExceededError) {
        throw new DeadlineExceededGrpcError(
          `Waiting period for state transition ${e.getTransactionHash()} exceeded`,
          {
            stateTransitionHash: e.getTransactionHash(),
          },
        );
      }
      throw e;
    }
    console.log(`[${new Date()}]: Got deliver result for ST ${hashString}`);

    const response = new WaitForStateTransitionResultResponse();

    const { result, tx } = data.data.value.TxResult;

    console.log(`[${new Date()}]: Checking if deliver result has any errors ${hashString}`);
    if (result && result.code !== undefined && result.code !== 0) {
      console.log(`[${new Date()}]: deliver result has errors! ${hashString}`);
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

      console.log(`[${new Date()}]: Sending error for ST ${hashString}`);
      return response;
    }

    console.log(`[${new Date()}]: No deliver errors for ST ${hashString}`);
    if (prove) {
      console.log(`[${new Date()}]: Requesting proofs for ST ${hashString}`);
      const stateTransition = await dpp.stateTransition.createFromBuffer(
        Buffer.from(tx, 'base64'),
        { skipValidation: true },
      );
      const proofObject = await fetchProof(stateTransition);
      console.log(`[${new Date()}]: Got proof for ST ${hashString}`);

      const proof = new Proof();
      proof.setRootTreeProof(proofObject.rootTreeProof);
      proof.setStoreTreeProof(proofObject.storeTreeProof);

      response.setProof(proof);
    }

    console.log(`[${new Date()}]: Sending the result ${hashString}. Sending the result`);
    return response;
  }

  return waitForStateTransitionResultHandler;
}

module.exports = waitForStateTransitionResultHandlerFactory;
