const request = require('request-promise-native');
const MockListGenerator = require('../mocks/dynamicMnList');

class Insight {
  /**
   * @param {Object} options
   * @param {string} options.uri - Insight api uri
   */
  constructor(options) {
    this.URI = options.uri;
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
