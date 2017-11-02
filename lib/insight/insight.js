const request = require('request-promise-native');

const URIS = {
  // FIXME : For now we just use an external insight, later on, we use embedded one
  testnet: 'http://dev-test.insight.dashevo.org/insight-api-dash',
  livenet: 'http://insight.dashevo.org/insight-api-dash',
};
class Insight {
  constructor(app) {
    this.URI = (app.config.livenet) ? URIS.livenet : URIS.testnet;
  }
  performGETRequest(path, req, res) {
    path = this.URI + path;
    req.pipe(request(path)).pipe(res);
    // TODO isvalidPath
  }
  performPOSTRequest(path, data, req, res) {
    path = this.URI + path;
    req.pipe(request.post({ url: path, form: data }), { end: false }).pipe(res);
  }

  // Todo: Temp to get last block hash for quorums //////////////////////////////////////////

  getLastBlockHash() {
    const refHeight = 100; // todo: move to config
    const uri = this.URI;
    return request({
      uri: `${uri}/status`,
      json: true,
    })
      .then(body => request({
        uri: `${uri}/block-index/${body.info.blocks - refHeight}`,
        json: true,
      }))
      .then(body => body.blockHash);
  }

  getMnList() {
    const uri = this.URI;
    return request({
      uri: `${uri}/masternodes/list/`,
      json: true,
    }).then(body => [body[0]]); // todo: temp only return first localhost server for dev purposes
  }

  getAddress(txHash) {
    const uri = this.URI;
    return request({
      uri: `${uri}/tx/${txHash}`,
      json: true,
    }).then(body => body.vin[0].addr);
  }

  // Temp insight quorums end /////////////////////////////////////////////////////////////////
}
module.exports = Insight;
