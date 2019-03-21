/* eslint class-methods-use-this: off */
/* eslint-disable no-unused-vars */
// Unused variables represent signatures for clarity
const AbstractDashDriveAdapter = require('../../lib/externalApis/dashDriveAdapter/AbstractDashDriveAdapter');

// Create a class, so JSDoc would work properly in our tests
class DashDriveFixture extends AbstractDashDriveAdapter {
  addSTPacket(rawStateTransition, rawSTPacket) { return Promise.resolve(); }

  fetchDapContract(contractId) { return Promise.resolve({}); }
}

module.exports = new DashDriveFixture();
