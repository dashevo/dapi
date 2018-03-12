const assert = require('assert');
const Logger = require('../lib/log/Logger');

// TODO: Write unit tests
xdescribe('Utils - Utils', () => {
  const logger = new Logger();
  const logger2 = new Logger('test.log');
  it('should be able to start a logger', () => {
    // TODO: test logger2 by checking file exist.
    assert.equal(typeof logger, 'object'); // bogus placeholder
    assert.equal(typeof logger2, 'object'); // bogus placeholder
  });
  it('should display log correctly', () => {
    // fixme How to test stdout ?
    const log = () => {
      logger.log("Test d'un log");

      logger.log('fatal', 'This is a specified fatal thing!');
      logger.fatal('This is a fatal thing!');

      logger.log('error', 'This is an error (log/err)');
      logger.error('This is also an error');

      logger.log('warn', 'This is a warning');
      logger.warn('This is also a warning');

      logger.log('notice', 'This is a important simple information');
      logger.notice('This is also a important simple information');

      logger.log('info', 'This is a simple information');
      logger.info('This is also a simple information');

      logger.log('debug', 'This is a debug thing');
      logger.debug('This is also a debug thing');

      logger.log('verbose', 'This is a verbose useless thing');
      logger.verbose('This is also a verbose useless thing');
    };
    assert.equal(typeof log, 'function'); // bogus placeholder
  });
});
