const Dapi = require('./lib/dapi');
//let dapi = new Dapi(require('./dapi.json'));

//QDEVTEMP
let dapiCount = 10; //start 10 dapi instances
let dapiArr = [];

let dapiBuilder = function() {
    dapiArr.push(new Dapi(require('./dapi.json')))
    if (dapiArr.length >= dapiCount) {
        clearInterval(dapiInt);
    }
}

let dapiInt = setInterval(dapiBuilder, 500);
//QDEVTEMP END



