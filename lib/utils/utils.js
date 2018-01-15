// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
function isPortTaken(port, ipv6 = false) {
  const net = require('net');
  return new Promise(((resolve, reject) => {
    try {
      const uri = ipv6 ? '::' : '127.0.0.1';
      const i = 0;
      const servlet = net.createServer();
      servlet.on('error', (err) => {
        if (err.code !== 'EADDRINUSE') {
          return reject(err);
        }
        return resolve(true);
      });
      servlet.on('listening', () => {
        servlet.close();
        return resolve(false);
      });
      servlet.on('close', () => resolve(false));
      servlet.listen(port, uri);
    } catch (e) {
      return reject(e);
    }
  }));
}
const fs = require('fs');
const util = require('util');

class Logger {
  // If a path is set, we log in file TODO
  constructor(options = { level: 'INFO' }) {
    const self = this;
    const LEVELS = [
      'FATAL',
      'ERROR',
      'WARN',
      'NOTICE',
      'INFO',
      'DEBUG',
      'VERBOSE',
    ];
    this.log = function () {
      let _log = '';
      let level = 4;// By default we display from info to fatal.
      const args = Array.prototype.slice.call(arguments);

      // We need to check if the first args is one of the level designed.
      if (args && args.length > 1 && LEVELS.indexOf(args[0].toUpperCase()) > -1) {
        level = LEVELS.indexOf(args[0].toUpperCase());
        args.shift();// Remove the level in order to avoid displaying it.
      }
      args.forEach((el) => {
        if (typeof el === 'string') {
          _log += ` ${el}`;
        } else {
          _log += ` ${util.inspect(el, false, null)}`;
        }
      });
      if (level <= self.level) {
        console.log(_log);
      }
    };

    // We create function for each of the different type of levels
    LEVELS.forEach((name, index) => {
      self[name] = index;
      self[name.toLowerCase()] = function () {
        const args = Array.prototype.slice.call(arguments);// We take all args passed by
        args.unshift(name);// We add the level as first args
        self.log.apply(null, args);// And we convert again to arguments
      };
    });

    this.level = self[options.level] || self.INFO;
  }
}
const Utils = {
  isPortTaken,
  Logger,
};


module.exports = Utils;
