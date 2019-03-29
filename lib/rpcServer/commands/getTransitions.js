const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/getTransitions');

const validator = new Validator(argsSchema);

/**
 * @param coreAPI
 * @return {getUser}
 */
const getTransitionsFactory = (coreAPI) => {
  /**
   * Layer 2 endpoint
   * Returns blockchain user
   * @typedef getTransitions
   * @param args
   * @param {string} args.userId
   * @param {number} [args.from]
   * @param {number} [args.to]
   * @return {Promise<object>}
   */
  async function getTransitions(args) {
    validator.validate(args);
    const { userId, from = 0, limit = 20 } = args;
    // If a user not found, this method will throw an error, and it will be handled properly
    const user = await coreAPI.getUser(userId);
    if (!user && !Array.isArray(user.subtx)) {
      return {
        transitions: [],
        totalCount: 0,
      };
    }
    const transactionIds = user.subtx.slice(from, from + limit);
    const transitions = await transactionIds.map(
      transactionId => coreAPI.getTransaction(transactionId),
    );
    return {
      transitions,
      totalCount: user.subtx.length,
    };
  }

  return getTransitions;
};

/* eslint-disable max-len */
/**
 * @swagger
 * /getUser:
 *   post:
 *      operationId: getUser
 *      deprecated: false
 *      summary: getUser
 *      description: Returns a blockchain user
 *      tags:
 *        - L2
 *      responses:
 *        200:
 *          description: Successful response. Promise (object) containing user info.
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
 *                  default: getUser
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
 *                    - userId
 *                  properties:
 *                    userId:
 *                      type: string
 *                      description: A user's registration tx id
 *                    from:
 *                      type: integer
 *                      description: Pagination
 *                    limit:
 *                      type: integer
 *                      description: how many transitions to fetch. Maximum 20.
 */
/* eslint-enable max-len */

module.exports = getTransitionsFactory;
