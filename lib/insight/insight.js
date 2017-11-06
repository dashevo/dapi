const request = require('request-promise-native');

const URIS = {
  // FIXME : For now we just use an external insight, later on, we use embedded one
  testnet: 'http://dev-test.insight.dashevo.org/insight-api-dash',
  livenet: 'http://insight.dashevo.org/insight-api-dash',
};
class Insight {

  constructor(app) {
		this.URI = (app.config.livenet) ? URIS['livenet'] : URIS['testnet'];
	}
	performGETRequest(path, req, res) {
		path = this.URI + path;
		req.headers['x-forwarded-for'] = req.ip;
		req.pipe(request(path)).pipe(res);
		//TODO isvalidPath	
	}
	performPOSTRequest(path, data, req, res) {
		path = this.URI + path;
		req.headers['x-forwarded-for'] = req.ip;
		req.pipe(request.post({ url: path, form: data }), { end: false }).pipe(res);
	}
  
  // Todo: Temp to get last block hash for quorums //////////////////////////////////////////

  async getLastBlockHash() {
    const refHeight = 100; // todo: move to config
    const uri = this.URI;
    const status = await request({
      uri: `${uri}/status`,
      json: true,
    });
    const blockIndex = await request({
      uri: `${uri}/block-index/${status.info.blocks - refHeight}`,
      json: true,
    });
    return blockIndex.blockHash;
  }

  async getMnList() {
    const uri = this.URI;
    const MNList = await request({
      uri: `${uri}/masternodes/list/`,
      json: true,
    });
    return [MNList[0]]; // todo: temp only return first localhost server for dev purposes
  }

  async getAddress(txHash) {
    const uri = this.URI;
    const transaction = await request({
      uri: `${uri}/tx/${txHash}`,
      json: true,
    });
    return transaction.vin[0].addr;
  }

	getAddress(txHash) {
		let uri = this.URI;
		return new Promise(function(resolve, reject) {
			request(uri + '/tx/' + txHash, function(err, response, body) {
				resolve(JSON.parse(body).vin[0].addr);
			});
		});
	}

	//Temp insight quorums end /////////////////////////////////////////////////////////////////
};
module.exports = Insight;
