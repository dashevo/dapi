const Dapi = require('./lib/dapi');
//let dapi = new Dapi(require('./dapi.json'));

//QDEVTEMP
let dapiCount = 2; //start 10 dapi instances
let dapiArr = [];


for (let i = 0; i < dapiCount; i++) {
    let config = require('./dapi.json');
    config.server.port = 3000 + i;
    dapiArr.push(new Dapi(config))
}




//QDEVTEMP END



