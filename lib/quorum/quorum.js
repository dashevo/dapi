class Quorum {
	constructor(app){
		this.logger = app.logger;
		
		this.logger.debug('- Init Quorum');
	}
	performAction(type, val){
		this.logger.debug('Quorum - Received action ', type, val);
		switch (type){
			case "add":{
				return this.addObject(val);
			}
			default:
				return "Not Implemented - PerformAction "+type;
		}
	}
	addObject(value){
		return {"response":"Added"};
	}
};
module.exports = Quorum;