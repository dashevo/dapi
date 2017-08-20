const Node = require('./lib/node/node');
const config = require('./dapi.json');
const {isPortTaken} = require('./lib/utils');
const onExit = require('signal-exit');

let node;
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
    try{
        node = new Node({
            debug:true,
            rep:rep,
            pub:pub,
            pubKey:pubKey+rep.port//Just in order to make it unique. TO BE REMOVED TODO
        });
    }catch (e) {
        console.log('Cannot start node...');
        console.error(e);
    }
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