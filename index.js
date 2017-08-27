const Dapi = require('./lib/dapi');
let dapi = new Dapi(require('./dapi.json'));

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
        dapi.node.stop(function(removed) {
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