const log = require('../../log');
const { transitionController } = require('../../controllers');

const sendTransition = async function sendTransition(args, callback) {
  const transitionData = args.data;
  try {
    const transitionId = await transitionController.sendTransition(transitionData);
    callback(null, transitionId);
  } catch (e) {
    log.error(e);
    callback(e);
  }
};

module.exports = sendTransition;