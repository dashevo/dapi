const request = require('request-promise-native');
const MockListGenerator = require('../../mocks/dynamicMnList');
const querystring = require('querystring');
const config = require('../../config/index');

class Insight {
  constructor() {
    this.URI = config.insightUri;
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

  async request(uri, method, data = {}) {
    const URI = `${this.URI}${uri}`;
    let response;
    if (method === 'GET') {
      const query = querystring.stringify(data);
      response = await request.get(URI, { json: true, qs: query });
    } else if (method === 'POST') {
      response = await request.post(URI, { json: true, body: data });
    } else {
      throw new Error(`Wrong method: ${method}`);
    }
    if (typeof response === 'string') {
      throw new Error(response);
    }
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.result) {
      // Some insight methods returns data that way
      return response;
    }
    return response.result;
  }

  async get(uri, data) {
    return this.request(uri, 'GET', data);
  }

  async post(uri, data) {
    return this.request(uri, 'POST', data);
  }

  async getUTXO(address) {
    return this.get(`/addr/${address}/utxo`);
  }

  async getBalance(address) {
    return this.get(`/addr/${address}/balance`);
  }

  async sendRawTransition(rawTransition) {
    throw new Error('Not implemented yet!');
  }

  async sendRawTransaction(rawTransaction) {
    return this.post('/tx/send', { rawtx: rawTransaction });
  }

  async getUser(usernameOrRegTx) {
    return this.get(`/getuser/${usernameOrRegTx}`);
  }

}

module.exports = Insight;
