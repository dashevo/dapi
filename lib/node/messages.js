/*
 * messages.js - DAPI Messages Class
 * Manage a message
 */
const defaultMessages = {
    'ping':{type:'ping'}
};
const _ = require('lodash');

class Messages {
    constructor(msgType){
        if(!_.has(defaultMessages, msgType)){
            return new Error(`${msgType} is not an allowed message's type.`);
        }
        this.data = JSON.parse(JSON.stringify(defaultMessages[msgType]));
    }
    prepare(){
        return JSON.stringify(this.data);
    }
}
module.exports=Messages;