const Node = require('./lib/node/node');
const config = require('./dapi.json');
const pjson = require('./package.json');
const {isPortTaken} = require('./lib/utils');

let node;
let ip;
let rep = config.node.rep;
let pub = config.node.pub;
let pubKey = config.node.pubKey;

async function prepareReplier() {
    let taken = await isPortTaken(rep.port);
    if(taken){
        rep.port++;
        await prepareReplier();
    }
    return true;
}
async function preparePublisher() {
    let taken = await isPortTaken(pub.port);
    if(taken){
        pub.port++;
        await preparePublisher();
    }
    return true;
}

async function starter(){
    await preparePublisher();
    await prepareReplier();
    //console.log('insight v.' + pjson.dependencies.insight-api-dash); get embedded insight api version programmatically
    try{
        node = new Node({
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
    }
}

starter();

// catching signals and do something before exit
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
    'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
].forEach(function (sig) {
    process.on(sig, function () {
        terminator(sig);
        console.log('signal: ' + sig);
    });
});

function terminator(sig) {
    if (typeof sig === "string") {
        // call your async task here and then call process.exit() after async task is done
        node.stop(function(removed) {
            console.log('Received %s - terminating server app ...', sig);
            console.log('node with removal hash', removed + ' has been removed');
            process.exit(1);
        });
    }
    console.log('Dapi node server is shutting down...');
}

process.on('uncaughtException', function (err) {
    console.log(err);
});