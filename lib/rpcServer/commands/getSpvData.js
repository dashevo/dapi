const spvServiceWrappedSpvData = spvService =>
  async (args, callback) => {
    try {
      const filter = args[0] || args.filter;
      return callback(null, await spvService.getSpvData(filter));
    } catch (error) {
      return callback({ code: 400, message: error.message });
    }
  };

module.exports = spvServiceWrappedSpvData;
