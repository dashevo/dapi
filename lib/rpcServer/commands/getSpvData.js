const SpvService = require('../../services/spv');

const getSpvData = async (args, callback) => {
  try {
    const filter = args[0] || args.filter;
    return callback(null, await SpvService.getSpvData(filter));
  } catch (error) {
    return callback({ code: 400, message: error.message });
  }
};

module.exports = getSpvData;
