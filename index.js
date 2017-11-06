const Dapi = require('./lib/dapi');
//let dapi = new Dapi(require('./dapi.json'));

//QDEVTEMP
let dapiArr = [];
let nonQuorumFactor = 10;

for (let i = 0; i < require('quorums-dash').quorumSize * nonQuorumFactor; i++) {
    let config = require('./dapi.json');
    config.server.port = 3000 + i;
    dapiArr.push(new Dapi(config))
}
//QDEVTEMP END



