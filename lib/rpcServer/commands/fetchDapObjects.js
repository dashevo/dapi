const Validator = require('../../utils/Validator');
const argsSchema = require('../schemas/fetchDapObjects');

const validator = new Validator(argsSchema);
/**
 * @param {AbstractDashDriveAdapter} dashDriveAPI
 * @return {fetchDapObjects}
 */
const fetchDapObjectsFactory = (dashDriveAPI) => {
  /**
   * Returns user dap space
   * @typedef fetchDapObjects
   * @param args - command arguments
   * @param {string} args.dapId
   * @param {string} args.type
   * @param {object} args.options
   * @return {Promise<object>}
   */
  async function fetchDapObjects(args) {
    validator.validate(args);
    const { dapId, type, options } = args;
    return dashDriveAPI.fetchDapObjects(dapId, type, options);
  }

  return fetchDapObjects;
};

module.exports = fetchDapObjectsFactory;
