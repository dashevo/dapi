const Node = require('./lib/node/node');
const config = require('./dapi.json');
const {isPortTaken} = require('./lib/utils');
const onExit = require('signal-exit');
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

onExit(function (code, signal) {
    console.log('process exited!');
    console.log('signal: ' + signal);
    console.log('remove ' + node.nodelisthash);
    node.stop(node.nodelisthash);
}, true)

process.on('uncaughtException', function (err) {
    console.log(err);
});