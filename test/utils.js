const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const { expect } = chai;

const assert = require('assert');
const Logger = require('../lib/log/Logger');

// TODO: Write unit tests
describe('Utils - Utils', () => {
  const logger = new Logger();
  const logger2 = new Logger('test.log');
  it('should be able to start a logger', () => {
    // TODO: test logger2 by checking file exist.
    assert.equal(typeof logger, 'object'); // bogus placeholder
    assert.equal(typeof logger2, 'object'); // bogus placeholder
  });

  // TODO: fixme How to test stdout ?

  it('should not be able to start a logger with invalid level', () => {
    expect(() => new Logger({ level: 'FAKE' })).to.throw('Logger: No log level matches FAKE');
  });

  it('should not be able to start log one item', () => {
    logger.info('dfsf');
  });

  it('should not be able to start log many items', () => {
    logger.info('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger.debug('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger.verbose('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger.warn('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger.debug('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger.fatal('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
  });

  it('should not send log in file', () => {
    logger2.info('dfsf');
  });

  it('should not be able to send logs in file', () => {
    logger2.info('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger2.debug('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger2.verbose('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger2.warn('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger2.debug('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
    logger.fatal('dfsf', 1, true, [1, 'edsd'], '', 'jdfs');
  });
});
