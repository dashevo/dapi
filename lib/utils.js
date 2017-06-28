function isPortTaken(port, ipv6 = false) {
    const net = require('net');
    return new Promise(function (resolve, reject) {
        try{
            let uri = ipv6 ? '::' : '127.0.0.1';
            let i = 0;
            let servlet = net.createServer();
            servlet.on('error', function (err) {
                if (err.code !== 'EADDRINUSE'){
                    return reject(err)
                }
                return resolve(true);
            });
            servlet.on('listening', function () {
                servlet.close();
                return resolve(false);
            });
            servlet.on('close', function () {
                return resolve(false);
            })
            servlet.listen(port, uri);
        }catch (e){
            return reject(e);
        }
    });
}
const fs = require('fs');
const util  = require('util');
class Logger{
    //If a path is set, we log in file
    constructor(path){
        let self = this;
        this.log = function (level=4) {
            let _log = "";
            let args = Array.prototype.slice.call(arguments);
            args.forEach(function (el) {
                if(typeof el==='string'){
                    _log +=" "+el;
                }else {
                    _log += ' '+util.inspect(el,false,null);
                }
            });
            if(level<=self.level){
                console.log(_log);
            }else {
                console.log(level, self.level);
            }
            // if(arguments.length==1)
            //
            // if (typeof arg === 'string') {
            //     message += ' ' + arg;
            // } else {
            //     message += ' ' + sys.inspect(arg, false, null);
            // }
        };
        [
            'FATAL',
            'ERROR',
            'WARN',
            'NOTICE',
            'INFO',
            'DEBUG',
            'VERBOSE'
        ].forEach(function (name, index) {
            self[name] = index;
            self[name.toLowerCase()]=self.log.call(index,arguments);
        });
        
        this.level = self['INFO']; //By default.
        console.log(this);
    }
}
const Utils = {
    isPortTaken:isPortTaken,
    Logger:Logger
};


module.exports = Utils;