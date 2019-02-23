const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/sendRawTransition');

const validator = new Validator(argsSchema);

function sendRawTransitionFactory(coreAPI, dashDriveAPI) {
  /**
   * Layer 2 endpoint
   * sends raw transition to quorum relay node and ST Packet to the local Drive
   *
   * @typedef sendRawTransition
   * @param args
   * @param args.rawTransitionHeader
   * @param args.rawTransitionPackett
   * @return {Promise<string>}
   */
  const sendRawTransition = async (args) => {
    validator.validate(args);

    const { rawTransitionPacket, rawTransitionHeader } = args;

    await dashDriveAPI.addSTPacket(rawTransitionPacket, rawTransitionHeader);

    return coreAPI.sendRawTransaction(rawTransitionHeader);
  };

  return sendRawTransition;
}

/* eslint-disable max-len */
/**
 * @swagger
 * /sendRawTransition:
 *   post:
 *      operationId: sendRawTransition
 *      deprecated: false
 *      summary: sendRawTransition
 *      description: Sends raw state transition to the network
 *      tags:
 *        - L2
 *      responses:
 *        200:
 *          description: Successful response. Promise (string) containing confirmed state transition transaction.
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - method
 *                - id
 *                - jsonrpc
 *                - params
 *              properties:
 *                method:
 *                  type: string
 *                  default: sendRawTransition
 *                  description: Method name
 *                id:
 *                  type: integer
 *                  default: 1
 *                  format: int32
 *                  description: Request ID
 *                jsonrpc:
 *                  type: string
 *                  default: '2.0'
 *                  description: JSON-RPC Version (2.0)
 *                params:
 *                  title: Parameters
 *                  type: object
 *                  required:
 *                    - rawTransitionHeader
 *                    - rawPacket
 *                  properties:
 *                    rawTransitionHeader:
 *                      type: string
 *                      default: ''
 *                      description: Raw transition
 *                    rawPacket:
 *                      type: string
 *                      default: ''
 *                      description: Raw ST Packet
 */
/* eslint-enable max-len */

module.exports = sendRawTransitionFactory;
