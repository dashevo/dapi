const { cl, is } = require('khal');

function handleBody(req, res) {
  if (req && req.hasOwnProperty('body')) {
    return req.body;
  }
  return returnResponse({ error: 'Missing body data' }, res);
}

function returnResponse(response, res) {
  return res.send(response);
}

function handleRequiredField(body, expectedFields, res, next) {
  let valid = true;
  if (expectedFields && expectedFields.constructor.name === 'Object') {
    for (let i = 0; i < Object.keys(expectedFields).length; i++) {
      const param = Object.keys(expectedFields)[i];
      const rules = expectedFields[param];

      if (!body.hasOwnProperty(param) && rules.required !== false) {
        returnResponse({ error: `Missing param ${param}` }, res);
        return false;
      }
      valid = (handleType(rules.type, body, param, rules.value, res));

      if (!valid) {
        return false;
      }// When one of above is false, return false.
    }
  }
  function handleType(type, body, param, rulesValue, res) {
    const paramData = body[param];
    const curryReturn = (data) => { returnResponse(data, res); };
    switch (type) {
      case 'enum':
        if (rulesValue.indexOf(paramData) === -1) {
          curryReturn({ error: `Param ${param} has invalid value '${paramData}', expected one of '${rulesValue}'` });
          return false;
        }
        break;
      case 'number':
        if (paramData.constructor.name !== 'Number' || !Number.isInteger(paramData)) {
          curryReturn({ error: `Param ${param} has invalid type ${paramData.constructor.name} - expected Number` });
          return false;
        }
        break;
      case 'json':
        if (paramData.constructor.name !== 'Object' || !is.JSON(paramData)) {
          curryReturn({ error: `Param ${param} has invalid type ${paramData.constructor.name} - expected JSON` });
          return false;
        }
        if (JSON.stringify(paramData).length <= 2) {
          curryReturn({ error: `Expected param ${param} to have at least a value - Received empty json` });
          return false;
        }
        break;
      default:
        throw new Error(`Not handled type ${type}`);
        break;
    }
    return true;
  }
  return true;
}

class Handlers {
  constructor(app) {
    const debug = app.logger.debug;
    const insight = app.insight;
    const authService = app.authService;
    const quorum = app.quorum;
    const qTempPort = app.config.server.port; // QDEVTEMP - remove

    return {
      post: {
        quorum(req, res, next) {
          const body = handleBody(req, res);

          if (!handleRequiredField(body, {
            verb: { required: true, type: 'enum', value: ['add', 'commit', 'remove', 'state', 'listen', 'migrate', 'auth'] },
            qid: { required: true, type: 'number' },
            data: { required: true, type: 'json' },
          }, res)) {
            // If field doesn't meet required rules, will be returned false and enter here in order to break
            // continuation of the logic
            return next();
          }

          quorum.isValidQuorum(body, qTempPort)
            .then((isValid) => {
              if (!isValid) {
                returnResponse(quorum.getQuroumFailedResponse(), res);
              } else {
                returnResponse(quorum.performAction(body.verb, { qid: body.qid, data: body.data }), res);
              }
            });
        },
        tx: {
          send(req, res) {
            const rawTX = req.body.rawtx;
            insight.performPOSTRequest('/tx', { rawtx: rawTX }, req, res);
          },
          sendix(req, res) {
            const rawTX = req.body.rawtx;
            insight.performPOSTRequest('/tx/sendix', { rawtx: rawTX }, req, res);
          },
        },
      },
      get: {
        blocks(req, res) {
          insight.performGETRequest('/blocks', req, res);
        },
        blockHeight(req, res) {
          const height = req.params.height;
          insight.performGETRequest(`/block-index/${height}`, req, res);
        },
        blockHash(req, res) {
          const hash = req.params.hash;
          insight.performGETRequest(`/block/${hash}`, req, res);
        },
        rawBlock(req, res) {
          const blockHash = req.body.blockHash;
          insight.performGETRequest(`/rawblock/${blockHash}`, req, res);
        },
        tx: {
          get(req, res) {
            const txID = req.params.txid;
            insight.performGETRequest(`/tx/${txID}`, req, res);
          },
        },
        currency(req, res) {
          insight.performGETRequest('/currency', req, res);
        },
        status(req, res) {
          if (req.query.q) {
            insight.performGETRequest(`/status?q=${req.query.q}`, req, res);
          } else {
            insight.performGETRequest('/status', req, res);
          }
        },
        sync(req, res) {
          insight.performGETRequest('/sync', req, res);
        },
        peer(req, res) {
          insight.performGETRequest('/peer', req, res);
        },
        version(req, res) {
          insight.performGETRequest('/version', req, res);
        },
        address: {
          get(req, res) {
            const addr = req.params.addr;
            insight.performGETRequest(`/addr/${addr}`, req, res);
          },
          utxos(req, res) {
            const addrs = req.params.addrs;
            insight.performGETRequest(`/addrs/${addr}/utxo`, req, res);
          },
          txs(req, res) {
            const addrs = req.params.addrs;
            insight.performGETRequest(`/addrs/${addr}/txs`, req, res);
          },
          totalReceived(req, res) {
            const addr = req.params.addr;
            insight.performGETRequest(`/addr/${addr}/totalReceived`, req, res);
          },
          totalSent(req, res) {
            const addr = req.params.addr;
            insight.performGETRequest(`/addr/${addr}/totalSent`, req, res);
          },
          unconfirmedBalance(req, res) {
            const addr = req.params.addr;
            insight.performGETRequest(`/addr/${addr}/unconfirmedBalance`, req, res);
          },
        },
        utils: {
          estimatefee(req, res) {
            const addr = req.params.addr;
            insight.performGETRequest('/utils/estimatefee', req, res);
            // does not exist on insight servers?
          },
        },
        info(req, res) {
          // This could be used in order to return app.rpc.getInfo();
          res.send('Unavailable');
        },
        mnList(req, res) {
          insight.getMnList()
            .then((l) => {
              res.send(l);
            });
        },
        mnUpdateList(req, res) {
          insight.getMnUpdateList(req.params.hash)
            .then((l) => {
              res.send(l);
            });
        },
        auth: {
          getChallenge: (req, res) => {
            res.send(authService.getChallenge(req.params.identifier));
          },
          // add further routes when specs are defined
        },
      },
    };
  }
}
module.exports = Handlers;
