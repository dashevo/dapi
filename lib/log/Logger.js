/* eslint-disable */
// TODO: Enable eslint and fix this design
const util = require('util');

class Logger {
  constructor(options = { level: 'INFO' }) {
    if (options.outputFilePath) {
      // TODO: File logging
    }

    const LEVELS = [
      'FATAL',
      'ERROR',
      'WARN',
      'NOTICE',
      'INFO',
      'DEBUG',
      'VERBOSE',
    ];

    // We create function for each of the different type of levels
    LEVELS.forEach((name, index) => {
      this[name] = index;
      this[name.toLowerCase()] = () => {
        const args = Array.prototype.slice.call(arguments);// We take all args passed by
        args.unshift(name);// We add the level as first args
        this.log.apply(null, args);// And we convert again to arguments
      };
    });

    this.level = options.level || this.INFO;
  }

  log(...restArgs) {
    let log = '';
    let level = 4;// By default we display from info to fatal.
    const args = Array.prototype.slice.call(restArgs);

    // We need to check if the first args is one of the level designed.
    if (args && args.length > 1 && LEVELS.indexOf(args[0].toUpperCase()) > -1) {
      level = LEVELS.indexOf(args[0].toUpperCase());
      args.shift();// Remove the level in order to avoid displaying it.
    }
    args.forEach((el) => {
      if (typeof el === 'string') {
        log += ` ${el}`;
      } else {
        log += ` ${util.inspect(el, false, null)}`;
      }
    });
    if (level <= this.level) {
      console.log(log);
    }
  }
}

module.exports = Logger;

