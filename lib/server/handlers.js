const {cl, is} = require('khal');

function handleBody(req, res) {
	if (req && req.hasOwnProperty('body')) {
		return req.body;
	}
	return returnResponse({error: "Missing body data"}, res);
}

function returnResponse(response, res) {
	return res.send(response);
}

function handleRequiredField(body, expectedFields, res, next) {
	let valid = true;
	if (expectedFields && expectedFields.constructor.name === "Object") {
		for (let i = 0; i < Object.keys(expectedFields).length; i++) {
			let param = Object.keys(expectedFields)[i];
			let rules = expectedFields[param];

			if (!body.hasOwnProperty(param) && rules.required !== false) {
				returnResponse({error: `Missing param ${param}`}, res);
				return false;
			}
			valid = (handleType(rules.type, body, param, rules.value, res));

			if (!valid) {
				return false;
			}//When one of above is false, return false.
		}
	}
	function handleType(type, body, param, rulesValue, res) {
		let paramData = body[param];
		let curryReturn = (data)=>{returnResponse(data, res)}
		switch (type){
			case "enum":
				if (rulesValue.indexOf(paramData) === -1) {
					curryReturn({error: `Param ${param} has invalid value '${paramData}', expected one of '${rulesValue}'`});
					return false;
				}
				break;
			case "number":
				if (paramData.constructor.name !== "Number" || !Number.isInteger(paramData)) {
					curryReturn({error: `Param ${param} has invalid type ${paramData.constructor.name} - expected Number`});
					return false;
				}
				break;
			case "json":
				if(paramData.constructor.name!=="Object" || !is.JSON(paramData)){
					curryReturn({error: `Param ${param} has invalid type ${paramData.constructor.name} - expected JSON`});
					return false;
				}
				if(JSON.stringify(paramData).length<=2){
					curryReturn({error:`Expected param ${param} to have at least a value - Received empty json`});
					return false;
				}
				break;
			default:
				throw new Error('Not handled type ' + type);
				break;
				
		}
		return true;
	}
	return true;
}

class Handlers {
	constructor(app) {
		let debug = app.logger.debug;
		return {
			post: {
				quorum: function (req, res, next) {
					let body = handleBody(req, res);
					if (!handleRequiredField(body, {
							verb: {required: true, type: 'enum', value: ['add', 'commit', 'remove']},
							qid: {required: true, type: 'number'},
							data: {required: true, type: 'json'}
						}, res)) {
						//If field doesn't meet required rules, will be returned false and enter here in order to break
						//continuation of the logic
						return next();
					}
					//At this point, we know we have required field with expected type.
					switch (body.verb){
						case "add":
							cl(app);
							break;
						default:
							returnResponse(`Not Implemented`, res);
							break;
					}
				}
			},
			get: {
				hello: function (req, res) {
					res.send('Hello World!');
				},
				info: function (req, res) {
					//This could be used in order to return app.rpc.getInfo();
					res.send('Unavailable');
				}
			}
		}
	}
}
module.exports = Handlers;