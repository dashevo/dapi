const AuthService = require('./authService/authService');
const Insight = require('./insight/insight');
const Server = require('./server/server');
const Quorum = require('./quorum/quorum');
const Node = require('./node/node');
const pjson = require('../package.json');
const {Logger} = require('./utils');
const {isPortTaken} = require('./utils');


class Dapi {
    constructor(config) {
        this.logger = new Logger();
        this.logger.level=this.logger.VERBOSE;
        this.config = config;
        this.insight = new Insight(this);
        this.quorum = new Quorum(this);
        this.authService = new AuthService(this);
        let self = this;
        setTimeout(function() {
            nodestarter(self).then(this.server = new Server(self));
        }, 2000)//We set this with a delay to let time for our node to start. Later we will remove that : FIXME.
    }
}

async function nodestarter(self){

    let ip;
    let rep = self.config.node.rep;
    let pub = self.config.node.pub;
    let pubKey = self.config.node.pubKey;

    await preparePublisher(pub);
    await prepareReplier(rep);

    //console.log('insight v.' + pjson.dependencies.insight-api-dash); get embedded insight api version programmatically
    try{
        self.node = new Node({
            version:pjson.version,
            insight:'0.5.0', // TODO: later on we get embedded insight api version programmatically from /status route, once it is available
            debug:true,
            rep:rep,
            pub:pub,
            pubKey:pubKey+rep.port,//Just in order to make it unique. TO BE REMOVED TODO
            nlhbTimeout:-1, //nodeList heartbeat timeout: if positiv value in milliseconds until polling dapilist stops; default -1 = no timeout
            nlhbInterval:900000, //nodeList heartbeat interval: interval in milliseconds; 15 min. = 900000 | set to a few seconds for testing
            nltsTimeout:1800001 //nodeList timestamp timeout: interval in milliseconds; 30 min. = 1800001 (should be > 2x nodeListHeartBeatInterval to make sure we don't delete a connected node that just didn't refresh in between)
        });
    }catch (e) {
        console.log('Cannot start node...');
        console.error(e);
        return false;
    }
}

async function prepareReplier(rep) {
    let taken = await isPortTaken(rep.port);
    if(taken){
        rep.port++;
        await prepareReplier(rep);
    }
    return true;
}
async function preparePublisher(pub) {
    let taken = await isPortTaken(pub.port);
    if(taken){
        pub.port++;
        await preparePublisher(pub);
    }
    return true;
}

module.exports = Dapi;
