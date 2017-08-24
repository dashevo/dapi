const request = require('request');
let URIS = {
	//FIXME : For now we just use an external insight, later on, we use embedded one
	testnet: 'http://dev-test.insight.dashevo.org/insight-api-dash',
	livenet: 'http://insight.dashevo.org/insight-api-dash'
};
class Insight {
	constructor(app) {
		this.URI = (app.config.livenet) ? URIS['livenet'] : URIS['testnet'];
	}
	performGETRequest(path, req, res) {
		path = this.URI+path;
		req.pipe(request(path)).pipe(res);
		//TODO isvalidPath	
	}
	performPOSTRequest(path, data, req, res){
		path = this.URI+path;
		req.pipe(request.post({url:path, form:data}), {end: false}).pipe(res);
	}
    performGetRequestPlus(path, req, res, cb){
        path = this.URI+path;
        request.get(path, (error, res, body) => {
        	cb(body);
        //    let json = JSON.parse(body);
        //    console.log(json);
            //req.pipe(request(path)).pipe(res);
        });
    }
};
module.exports = Insight;