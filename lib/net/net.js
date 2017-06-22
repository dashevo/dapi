/*
 * net.js - Networking backbone of DAPI 
 * Use zmq(0mq) to enable connecting.
 * 
 */

const _ = require('lodash');
const publisher = require('./publisher');
const subscriber = require('./subscriber');
const replier = require('./replier');
const requester = require('./requester');
const NET_TYPES = {
    "publisher": publisher,
    "pub": publisher,
    "subscriber": subscriber,
    "sub": subscriber,
    "replier": replier,
    "rep": replier,
    "requester": requester,
    "req": requester
};

class Net {
    constructor() {
    }

    /**
     *
     * @param params - an object containing theses data :
     *          type (required) : A valid DAPi networking-type being a string of either (sub,subscriber, pub,publisher, req,requester, rep,replier)
     *          addr (required) : The address to which you want to sub/pub or whatever
     *
     */
    attach(params) {
        let self = this;
        const {isPortTaken} = require('../utils');

        function validAddr(uri) {
            return (uri && uri.constructor.name == "String" && uri.indexOf(':') > 0)
        }

        if (!_.has(params, 'type') || !NET_TYPES[params.type]) {
            throw new Error(`Not supported type. Valid type are : \n\t    ${Object.keys(NET_TYPES)}`);
        }
        if (!_.has(params, 'uri') || !validAddr(params['uri'])) {
            throw new Error(`Invalid or missing params uri - Received : ${params['uri']}`);
        }
        try {
            let uri = params['uri'];
            let hostname = uri.split(':')[0];
            let port = uri.split(':')[1];
            return isPortTaken(port)
                .then(function (isTaken) {
                    if (!isTaken) {
                        let socket = new NET_TYPES[params.type]({uri: params['uri']});
                        socket.attach();
                        return socket;
                    }
                    let uri = `${hostname}:${Number.parseInt(port)+1}`;
                    console.log(uri);
                    return self.attach({type:params.type,uri:uri})
                });

        } catch (e) {
            console.error(e);
            return false;
        }

    }

    detach(sock) {
        if (sock && _.has(sock, 'type') && _.has(sock, '_zmq')) {
            sock.close();
        }
    }
}
;
module.exports = Net;