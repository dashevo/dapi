const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/addresses');

const validator = new Validator(argsSchema);

/**
 * @param insightAPI
 * @return {getStatus}
 */
const getStatusFactory = (insightAPI) => {
  /**
   * Util endpoint
   * get status of current DAPI Node
   * @typedef getStatus
   * @return {Promise<object>}
   */
  async function getStatus() {
    return insightAPI.getStatus();
  }

  return getStatus;
};

/* eslint-disable max-len */
/**
 * @swagger
 * /getStatus:
 *   get:
 *      operationId: getStatus
 *      deprecated: false
 *      summary: getStatus
 *      description: Get status of a DAPI Node
 *      tags:
 *        - Util
 *      responses:
 *        200:
 *          description: Successful response. Promise (object) containing status details for the node.
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
 *                  default: getStatus
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

module.exports = getStatusFactory;
