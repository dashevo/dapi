const SpvService = require('./spv');
const MnListService = require('./mnList');

module.exports = {
  spvService: new SpvService(),
  mnListService: new MnListService(),
};

