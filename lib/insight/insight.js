const request = require('request');
const express = require('express');
const req = express.request;
const res = express.response;
let URIS = {
	//FIXME : For now we just use an external insight, later on, we use embedded one
	testnet: 'http://dev-test.insight.dashevo.org/insight-api-dash',
	livenet: 'http://insight.dashevo.org/insight-api-dash'
};
class Insight {
	constructor(app) {
		this.URI = (app.config.livenet) ? URIS['livenet'] : URIS['testnet'];
        let status;
        let self = this;
        this.performGetRequestBody('/status', req, res, function (status) {
            status = JSON.parse(status);
            let insightversion = status.info.insightversion || 'N/A';
            self.version = insightversion;
        });
	}
	performGETRequest(path, req, res) {
		path = this.URI+path;
		req.pipe(request(path)).pipe(res);
		//TODO isvalidPath	
	}
    performGetRequestBody(path, req, res, cb){
        path = this.URI+path;
        request.get(path, (error, res, body) => {
            cb(body);
        });
    }
	performPOSTRequest(path, data, req, res){
		path = this.URI+path;
		req.pipe(request.post({url:path, form:data}), {end: false}).pipe(res);
	}
}
module.exports = Insight;