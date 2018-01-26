const requestPromiseNative = require('request-promise-native');
const MockListGenerator = require('../../mocks/dynamicMnList');
const querystring = require('querystring');
const config = require('../../config/index');

const URI = config.insightUri;
const mnListGenerator = new MockListGenerator();

const request = async (uri, method, data = {}) => {
  const fullURI = `${URI}${uri}`;
  let response;
  if (method === 'GET') {
    const query = querystring.stringify(data);
    response = await requestPromiseNative.get(fullURI, { json: true, qs: query });
  } else if (method === 'POST') {
    response = await requestPromiseNative.post(fullURI, { json: true, body: data });
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
};

const performGETRequest = (path, req, res) => {
  const fullPath = URI + path;
  req.pipe(requestPromiseNative(fullPath)).pipe(res);
  req.headers['x-forwarded-for'] = req.ip;
  // TODO: isValidPath
};

const performPOSTRequest = (path, data, req, res) => {
  const fullPath = URI + path;
  req.pipe(requestPromiseNative.post({ url: fullPath, form: data }), { end: false }).pipe(res);
  req.headers['x-forwarded-for'] = req.ip;
};

const getAddress = (txHash) => {
  const uri = URI;
  return new Promise(((resolve, reject) => {
    requestPromiseNative(`${uri}/tx/${txHash}`, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body).vin[0].addr);
    });
  }));
};

const getCurrentBlockHeight = () => {
  const uri = this.URI;
  return new Promise(((resolve, reject) => {
    requestPromiseNative(`${uri}/status`, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body).info.blocks);
    });
  }));
};

const getHashFromHeight = (height) => {
  const uri = this.URI;
  return new Promise(((resolve, reject) => {
    requestPromiseNative(`${uri}/block-index/${height}`, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body).blockHash);
    });
  }));
};

const getMnList = () => mnListGenerator.getMockMnList();
const getMnUpdateList = () => mnListGenerator.getMockMnUpdateList();
const get = async (uri, data) => request(uri, 'GET', data);
const post = async (uri, data) => request(uri, 'POST', data);
const getUTXO = async address => get(`/addr/${address}/utxo`);
const getBalance = async address => get(`/addr/${address}/balance`);
const sendRawTransition = async rawTransition => post('/ts/send', { rawts: rawTransition });
const sendRawTransaction = async rawTransaction => post('/tx/send', { rawtx: rawTransaction });
const getUser = async usernameOrRegTx => get(`/getuser/${usernameOrRegTx}`);

const getBestBlockHeight = async () => {
  const res = await get('/bestBlockHeight');
  return res.height;
};

const getBlockHash = async (blockHeight) => {
  const res = await get(`/block-index/${blockHeight}`);
  return res.blockHash;
};

module.exports = {
  performGETRequest,
  performPOSTRequest,
  getAddress,
  getCurrentBlockHeight,
  getHashFromHeight,
  getMnList,
  getMnUpdateList,
  request,
  get,
  post,
  getUTXO,
  getBalance,
  sendRawTransition,
  sendRawTransaction,
  getUser,
  getBestBlockHeight,
  getBlockHash,
};

