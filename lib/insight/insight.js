const request = require('request');
const cache = require('../caching/cachecontroller')
const listUtils = require('../utils/listUtils')
const qDash = require('quorums-dash')

let URIS = {
	//FIXME : For now we just use an external insight, later on, we use embedded one
	testnet: 'http://dev-test.insight.dashevo.org/insight-api-dash',
	livenet: 'http://insight.dashevo.org/insight-api-dash'
};
class Insight {
	constructor(app) {
		this.URI = (app.config.livenet) ? URIS['livenet'] : URIS['testnet'];
		this.cache = new cache();

		this.lastHrMinCached = 0 //QDEVTEMP
	}
	performGETRequest(path, req, res) {
		path = this.URI + path;
		req.pipe(request(path)).pipe(res);
		//TODO isvalidPath	
	}
	performPOSTRequest(path, data, req, res) {
		path = this.URI + path;
		req.pipe(request.post({ url: path, form: data }), { end: false }).pipe(res);
	}

	//Todo: Temp to get last block hash for quorums //////////////////////////////////////////

	getLastBlockHash() {

		const refHeight = 100; //todo: move to config
		let uri = this.URI;
		return new Promise(function(resolve, reject) {
			request(uri + '/status', function(err, response, body) {
				if (err) reject(err);
				request(uri + `/block-index/${JSON.parse(body).info.blocks - refHeight}`, function(err, response, body) {
					if (err) reject(err);
					resolve(JSON.parse(body).blockHash);
				});
			});
		});
	}

	addDifferenceSet(newList) {

	}

	cacheNewMnList() {
		let self = this;
		return new Promise(function(resolve, reject) {
			request(self.URI + '/masternodes/list/', function(err, response, body) {
				if (err) reject(err)
				let list = require('quorums-dash').getMockMnList() // JSON.parse(body); QDEVTEMP
				self.lastHrMinCached = `${new Date().getHours()} ${new Date().getMinutes()}` //QDEVTEMP

				let cachableList = listUtils.getCacheableList(list);
				self.cache.setMnList(qDash.getHash(cachableList), cachableList)

				resolve(true)
			});
		})
	}

	getMnList() {
		let self = this;
		return new Promise(function(resolve, reject) {

			if (self.lastHrMinCached != `${new Date().getHours()} ${new Date().getMinutes()}`) {
				self.cacheNewMnList()
					.then(success => {
						if (success) {
							resolve(self.cache.getLastMnList())
						}
					})
			}
			else {
				self.cache.getLastMnList()
					.then(l => {
						resolve(l)
					})
			}
		})
	}

	getMnUpdateList(hash) {

		let self = this;
		return new Promise(function(resolve, reject) {
			self.getMnList()
				.then(list => {
					if (self.cache.getLastMnListKey() == hash) {
						resolve({ type: 'none' })
					}
					else if (self.cache.isDiffCached(hash)) {
						resolve({
							type: 'update',
							list: self.cache.getDiffCache(hash)
						})
					}
					else {
						resolve({
							type: 'full',
							list: list
						})
					}
				})
		})
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