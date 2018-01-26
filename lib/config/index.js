// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
/**
 * @typedef {Object} Config
 * @property {string} name
 * @property {string} insightUri
 * @property {Object} server
 * @property {boolean} server.enable
 * @property {number} server.port
 * @property {Object} node
 * @property {string} node.pubKey
 * @property {number} node.rep.port
 * @property {number} node.pub.port
 */

let config;

try {
  config = require('./config.json');
  console.info('Using config from config.json');
} catch (e) {
  console.warn('No config.json file was provided in lib/config');
  console.warn('Using default config instead');
  config = require('./default.config.json');
}

/**
 * @returns {Config}
 */
function getConfig() {
  return config;
}

/**
 * @type {Config}
 */
module.exports = getConfig();
