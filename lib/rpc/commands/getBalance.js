const getBalance = async function getBalance(args, callback) {
  try {
    const address = args[0] || args.address;

    rpc.getReceivedByAddress(address, function (err, res) {
      if (!err) {
        return callback(null, res)
      }
      else {
        return callback({ code: err.code, message: err.message });
      }
    })
  }
  catch (e) {
    return callback({ code: 400, message: e.message });
  }
};

module.exports = getBalance;
