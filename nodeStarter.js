const Node = require('./lib/node/node');
const config = require('./dapi.json');
const {isPortTaken} = require('./lib/utils');
const ifaces = require('os').networkInterfaces();

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
    await getIP(); //get ip programmatically @cofresi
    try{
        node = new Node({
            debug:true,
            rep:rep,
            pub:pub,
            pubKey:pubKey+rep.port,//Just in order to make it unique. TO BE REMOVED TODO
            ip:ip
        });
    }catch (e) {
        console.log('Cannot start node...');
        console.error(e);
    }
}

async function getIP () {
    let address;
    Object.keys(ifaces).forEach(dev => {
        ifaces[dev].filter(details => {
            if (details.family === 'IPv4' && details.internal === false) {
                address = details.address;
                ip = address;
            }
        });
    });
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