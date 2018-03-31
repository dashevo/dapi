// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const EventEmitter2 = require('eventemitter2').EventEmitter2;

const emitter = new EventEmitter2({
  wildcard: true,
  maxListeners: 20,
  verboseMemoryLeak: true,
});
module.exports = emitter;
