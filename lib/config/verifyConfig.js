const validator = require('validator');
const log = require('../log');


function verifyURL(url, component) {
  const valid = validator.isURL(url);
  if (!valid) {
    log.error(component, 'value is not a valid. Valid url expected, found:', url);
  }
  return valid;
}

function verifyHost(host, component) {
  const valid = validator.isIP(host) || validator.isFQDN(host);
  if (!valid) {
    log.error(component, 'value is not a valid. Valid host or ip address expected, found:', host);
  }
  return valid;
}

function verifyPort(port, component) {
  const isPort = validator.isPort(port);
  if (!isPort) {
    console.log(component, 'value is not a valid. Valid port expected, found:', port);
  }
  return isPort;
}

function verifyConfig(config) {
  let valid = true;
  valid = verifyURL(config.insightUri, 'INSIGHT_URI');
  valid = verifyHost(config.dashcore.p2p.host, 'DASHCORE_P2P_HOST') && valid;
  valid = verifyPort(config.dashcore.p2p.port, 'DASHCORE_P2P_PORT') && valid;
  valid = verifyHost(config.dashcore.rpc.host, 'DASHDRIVE_RPC_HOST') && valid;
  valid = verifyPort(config.dashcore.rpc.port, 'DASHDRIVE_RPC_PORT') && valid;
  valid = verifyHost(config.dashcore.zmq.host, 'DASHCORE_ZMQ_HOST') && valid;
  valid = verifyPort(config.dashcore.zmq.port, 'DASHCORE_ZMQ_PORT') && valid;
  valid = verifyHost(config.dashDrive.host, 'DASHDRIVE_RPC_HOST') && valid;
  valid = verifyPort(config.dashDrive.port, 'DASHDRIVE_RPC_PORT') && valid;
  valid = verifyPort(config.server.port.toString(), 'RPC_SERVER_PORT') && valid;

  if (!valid) {
    process.exit();
  }
}


module.exports = verifyConfig;


// 0 = "INSIGHT_URI=http://172.18.0.7:23498/insight-api-dash"
// 1 = "DASHCORE_RPC_HOST=172.18.0.3"
// 2 = "DASHCORE_RPC_PORT=25756"
// 3 = "DASHCORE_RPC_USER=dashrpc"
// 4 = "DASHCORE_RPC_PASS=password"
// 5 = "DASHCORE_ZMQ_HOST=172.18.0.3"
// 6 = "DASHCORE_ZMQ_PORT=40441"
// 7 = "DASHCORE_P2P_HOST=172.18.0.3"
// 8 = "DASHCORE_P2P_PORT=25811"
// 9 = "DASHDRIVE_RPC_PORT=56372"
// 10 = "DASHCORE_P2P_NETWORK=regtest"
// 11 = "NETWORK=regtest"
// 12 = "DASHDRIVE_RPC_HOST=docker.for.mac.localhost"
// length = 13
