const request = require('request-promise-native');
const MockListGenerator = require('../mocks/dynamicMnList');

const URIS = {
  // FIXME : For now we just use an external insight, later on, we use embedded one
  testnet: 'http://dev-test.insight.dashevo.org/insight-api-dash',
  livenet: 'http://insight.dashevo.org/insight-api-dash',
};

class Insight {
  constructor(app) {
    // TODO: need to remove app from constructor
    this.URI = (app.config.livenet) ? URIS.livenet : URIS.testnet;
    this.mnListGenerator = new MockListGenerator();
  }

  performGETRequest(path, req, res) {
    path = this.URI + path;
    req.pipe(request(path)).pipe(res);
    req.headers['x-forwarded-for'] = req.ip;
    // TODO isvalidPath
  }

  performPOSTRequest(path, data, req, res) {
    path = this.URI + path;
    req.pipe(request.post({ url: path, form: data }), { end: false }).pipe(res);
    req.headers['x-forwarded-for'] = req.ip;
  }

  getAddress(txHash) {
    const uri = this.URI;
    return new Promise(((resolve, reject) => {
      request(`${uri}/tx/${txHash}`, (err, response, body) => {
        resolve(JSON.parse(body).vin[0].addr);
      });
    }));
  }

  getCurrentBlockHeight() {
    const uri = this.URI;
    return new Promise(((resolve, reject) => {
      request(`${uri}/status`, (err, response, body) => {
        resolve(JSON.parse(body).info.blocks);
      });
    }));
  }

  getHashFromHeight(height) {
    const uri = this.URI;
    return new Promise(((resolve, reject) => {
      request(`${uri}/block-index/${height}`, (err, response, body) => {
        resolve(JSON.parse(body).blockHash);
      });
    }));
  }

  getMnList() {
    return this.mnListGenerator.getMockMnList();
  }

  getMnUpdateList(hash) {
    return this.mnListGenerator.getMockMnUpdateList();
  }

  async getUser(usernameOrRegTx) {
    return request(`${this.URI}/getuser/${usernameOrRegTx}`);
  }
}

module.exports = Insight;
