const {
  SubTx, Transition, State,
} = require('@dashevo/dash-schema/lib').Consensus;
const jayson = require('jayson');

const config = require('./config');
const insight = require('./insight');

const log = console;

const logic = {
  async sendRawSubtx(transactionData) {
    if (!SubTx.validate(transactionData)) {
      throw new Error('SubTx data is not valid');
    }
    return State.getTSID(transactionData);
  },
};

const server = jayson.server({

  /**
   * Passes signed transaction to dashd. Transaction must be constructed and signed on client side.
   * @param args
   * @param callback
   */
  async sendRawTransaction(args, callback) {
    const signedTransaction = args[0];
    try {
      const subTxId = await insight.sendRawTransaction(signedTransaction);
      return callback(null, subTxId);
    } catch (e) {
      log.error(e.stack);
      return callback({ code: 400, message: e.message });
    }
  },

});

const port = 4019;

server.http().listen(port);
log.info(`RPC is running in ${config.name} mode`);
log.info(`Insight uri is ${config.insightUri}`);
log.info(`RPC server is listening on port ${port}`);

