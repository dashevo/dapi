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
    let nlhbInterval = self.config.node.list.heartbeatInterval;
    let nltsTimeout = self.config.node.list.timestampTimeout;

    await preparePublisher(pub);
    await prepareReplier(rep);

    //console.log('insight v.' + pjson.dependencies.insight-api-dash); get embedded insight api version programmatically
    try{
        self.node = new Node({
            version:pjson.version,
            insight:self.insight.version,
            mempoolPort:5001,
            dapiListPort:5001,
            debug:true,
            rep:rep,
            pub:pub,
            pubKey:pubKey+rep.port,//Just in order to make it unique. TO BE REMOVED TODO
            nlhbInterval:nlhbInterval,
            nltsTimeout:nltsTimeout
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
