const { expect } = require('chai');

const { Insight } = require('../../lib/insight/insight');

// Stubs
const app = { config: {} };

// Disable no-undef rule for mocha
/* eslint-disable no-undef */
describe('Insight', () => {
  const insight = new Insight(app);

  describe('.getLastBlockHash', () => {

  });

  describe('.getMnList', () => {

  });

  describe('.getAddress', () => {

  });
});

