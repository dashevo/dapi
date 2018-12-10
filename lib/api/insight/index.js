const requestPromiseNative = require('request-promise-native');
const querystring = require('querystring');
const config = require('../../config/index');

const URI = config.insightUri;

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

const get = async (uri, data) => request(uri, 'GET', data);
const post = async (uri, data) => request(uri, 'POST', data);

const getUTXO = async address => get(`/addr/${address}/utxo`);
const sendRawTransaction = async rawTransaction => post('/tx/send', { rawtx: rawTransaction });

const getAddressSummary = async (address) => {
  const res = await get(`/addr/${address}`);
  return res;
};

// TODO: wallet-lib expects one that is OK without a query string
const getStatus = async (queryString) => {
  switch (queryString) {
    case 'getInfo':
      break;
    case 'getDifficulty':
      break;
    case 'getBestBlockHash':
      break;
    case 'getLastBlockHash':
      break;
    default:
      throw new Error('Invalid query string.');
  }
  const res = await get(`/status?q=${queryString}`);
  return res;
};

const getTransactionById = async (txid) => {
  const res = await get(`/tx/${txid}`);
  return res;
};

const sendRawIxTransaction = async (rawtx) => {
  const res = post('/tx/sendix', { rawtx });
  return res;
};

module.exports = {
  request,
  get,
  post,
  getUTXO,
  sendRawTransaction,
  getAddressSummary,
  getTransactionById,
  getStatus,
  sendRawIxTransaction,
};
