'use strict'
const Message = require('bitcore-message-dash');
const inMemDb = require('./inMemDb');
const mocks = require('../mocks/mocks')

class AuthService {

    constructor(app) {
        this.app = app;
    }

    isValidTxId(txId) {
        return true;
    }

    getChallenge(identifier) {
        var challenge = Math.random().toString(36).substring(7);
        inMemDb.setChallenge(identifier, challenge);
        return challenge;
    }

    getUserObj() {
        return new Promise(function(resolve, reject) {
            resolve(mocks.mocksUser);
        });
    }

    resolveChallenge(username, nonce, signature) {
        return this.getUserObj(username)
            .then(userObj => {
                if (nonce != userObj.Header.ObjNonce + 1) {
                    return false;
                }
                else {
                    // this.app.insight.getTx(userObj.Header.RegTX)
                    return true
                }
            })
            .then(txData => {
                //todo: temp removal because of new testnet and transaction no longer existing
                //awaiting SDK tests to pass which will create a new valid tx on the blockchain whereafter this can be re-enabled

                return true;

                // let rawData = txData.vout.filter(o => o.scriptPubKey.asm.includes('OP_RETURN'))[0]
                //     .scriptPubKey.asm.replace('OP_RETURN ', '');
                // let data = JSON.parse(new Buffer(rawData, 'hex').toString('utf8'));
                // let pubKey = data.pubKey;
 
                // return Message(nonce).verify(pubKey, signature);

            }).catch(function(err) {
                console.error('Error ', err);
                return false;
            })
    }

}
module.exports = AuthService;