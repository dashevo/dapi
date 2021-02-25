const BlockchainListener = require('./blockchainListener/BlockchainListener');

/**
 * @param {BlockchainListener} blockchainListener
 */
function waitForHeightFactory(blockchainListener) {
  let currentHeight = 0;

  blockchainListener.on(BlockchainListener.EVENTS.NEW_BLOCK, (message) => {
    currentHeight = message.height;
  });

  /**
   * @typedef {waitForHeight}
   * @param {number} height
   * @return {Promise<void>}
   */
  function waitForHeight(height) {
    return new Promise((resolve) => {
      if (currentHeight >= height) {
        resolve();

        return;
      }

      const handler = () => {
        if (currentHeight >= height) {
          blockchainListener.off(BlockchainListener.EVENTS.NEW_BLOCK, handler);
          resolve();
        }
      };

      blockchainListener.on(BlockchainListener.EVENTS.NEW_BLOCK, handler);
    });
  }

  return waitForHeight;
}

module.exports = waitForHeightFactory;
