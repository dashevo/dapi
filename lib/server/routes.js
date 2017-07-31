const Handlers = require('./handlers');
const Routes = {
    setup: function(app) {
        let handlers = new Handlers(app);

	    app.server.get('/', handlers.get.hello);
	    /*
			Quorum entry point.
			verb : - add, commit, remove.
			qid : Quorum ID of a user (based on masterblock)
			data : hexData. 
		 */
        app.server.post('/quorum', handlers.post.quorum);
        
        // app.server.get('/blockcount', handlers.getBlockCount);
        // app.server.get('/getinfo', handlers.getInfo);
    }
};
module.exports = Routes;