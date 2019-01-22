const validator = require('validator');

/**
 * @param url
 * @param parameterName
 * @returns {{isValid: boolean, validationError: null|string}}
 */
function validateURI(url, parameterName) {
  const validationResult = {
    isValid: validator.isURL(url),
    validationError: null,
  };
  if (!validationResult.isValid) {
    validationResult.validationError = `${parameterName} value is not valid. Valid url expected, found:: ${url}`;
  }
  return validationResult;
}

/**
 * @param host
 * @param parameterName
 * @returns {{isValid: boolean, validationError: null|string}}
 */
function validateHost(host, parameterName) {
  const validationResult = {
    isValid: validator.isIP(host) || validator.isFQDN(host),
    validationError: null,
  };
  if (!validationResult.isValid) {
    validationResult.validationError = `${parameterName} value is not valid. Valid host or ip address expected, found: ${host}`;
  }
  return validationResult;
}

/**
 * @param {number|string} port
 * @param {string} parameterName
 * @returns {{isValid: boolean, validationError: null|string}}
 */
function validatePort(port, parameterName) {
  const validationResult = {
    isValid: validator.isPort(port.toString()),
    validationError: null,
  };
  if (!validationResult.isValid) {
    validationResult.validationError = `${parameterName} value is not valid. Valid port expected, found: ${port}`;
  }
  return validationResult;
}

/**
 * @param {Object} config
 * @returns {{isValid: boolean, validationErrors: (string|null)[]}}
 */
function validate(config) {
  const validationResults = [];
  validationResults.push(validateURI(config.insightUri, 'INSIGHT_URI'));
  validationResults.push(validateHost(config.dashcore.p2p.host, 'DASHCORE_P2P_HOST'));
  validationResults.push(validatePort(config.dashcore.p2p.port, 'DASHCORE_P2P_PORT'));
  validationResults.push(validateHost(config.dashcore.rpc.host, 'DASHDRIVE_RPC_HOST'));
  validationResults.push(validatePort(config.dashcore.rpc.port, 'DASHDRIVE_RPC_PORT'));
  validationResults.push(validateHost(config.dashcore.zmq.host, 'DASHCORE_ZMQ_HOST'));
  validationResults.push(validatePort(config.dashcore.zmq.port, 'DASHCORE_ZMQ_PORT'));
  validationResults.push(validateHost(config.dashDrive.host, 'DASHDRIVE_RPC_HOST'));
  validationResults.push(validatePort(config.dashDrive.port, 'DASHDRIVE_RPC_PORT'));
  validationResults.push(validatePort(config.server.port.toString(), 'RPC_SERVER_PORT'));

  const validationErrors = validationResults
    .filter(validationResult => !validationResult.isValid)
    .map(validationResult => validationResult.validationError);

  return {
    isValid: validationErrors.length < 1,
    validationErrors,
  };
}

module.exports = validate;
