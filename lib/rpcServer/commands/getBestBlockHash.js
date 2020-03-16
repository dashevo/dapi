const RPCError = require('../RPCError');

/**
 * @param {Object} coreAPI
 * @return {getBestBlockHash}
 */
const getBestBlockHashFactory = (coreAPI) => {
  /**
   * Layer 1 endpoint
   * Returns block hash of the chaintip
   * @typedef getBestBlockHash
   * @return {Promise<string>} - latest block hash
   */
  async function getBestBlockHash() {
    let result;
    try {
      result = await coreAPI.getBestBlockHash();
    } catch (e) {
      if (e.statusCode === 400) {
        throw new RPCError(-32602, e.message || 'Invalid params');
      }

      throw new RPCError(-32603, e.message || 'Internal error');
    }

    return result;
  }

  return getBestBlockHash;
};

/* eslint-disable max-len */
/**
 * @swagger
 * /getBestBlockHash:
 *   post:
 *      operationId: getBestBlockHash
 *      deprecated: false
 *      summary: getBestBlockHash
 *      description: Returns block hash of the chaintip
 *      tags:
 *        - L1
 *      responses:
 *        200:
 *          description: Successful response. Promise (string) containing the latest block hash.
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - method
 *                - id
 *                - jsonrpc
 *              properties:
 *                method:
 *                  type: string
 *                  default: getBestBlockHash
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
 */
/* eslint-enable max-len */

module.exports = getBestBlockHashFactory;
