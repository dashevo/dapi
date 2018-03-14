const config = require('../../config');
const qDash = require('quorums-dash');
const dashcore = require('../../api/dashcore/rpc');
const logger = require('../../log');
const insight = require('../../api/insight');
const dkg = require('dkg');
const bls = require('bls-lib');
const mocks = require('../../mocks/mocks');
const KeyValueStore = require('../mempool/keyValueStore');

const quorumService = {
  start(dashcoreZmqClient) {
    const newBlockEvent = dashcoreZmqClient.topics.hashblock;
    // get pubkey directly from dashcore.rpc in production
    this.pubkey = mocks.node.pubKey;
    logger.debug('Init Quorum');
    logger.debug(`pubkey = ${this.pubkey}`);
    /* TODO: error handling for when dapi is started before MN is
    synced and therefore fails to connect with zmq */

    dashcoreZmqClient.on(newBlockEvent, async (msg) => {
      const hash = msg.toString('hex');
      const height = await dashcore.getCurrentBlockHeight();
      // let's see if we have a new heartbeat and need to migrate/join new quorum
      const isHeartBeat = height % qDash.getHeartBeatInterval() === 0;
      logger.debug(newBlockEvent, msg, hash, height, isHeartBeat);
      if (isHeartBeat) {
        // here comes the action!
        this.informClients();
        this.migrateClients();
        this.joinQuorum();
      }
    });
  },

  async informClients() {
    logger.debug('inform connected clients about heartbeat');
    // TODO: whatever we need to inform our connected clients
  },

  async migrateClients() {
    logger.debug('migrate connected clients');
    // TODO: whatever we need to migrate our connected clients
  },

  async joinQuorum() {
    logger.debug('join new Quorum');
    this.getQuorum()
      .then((quorumData) => {
        this.dkg(quorumData);
      });
  },

  async dkg(quorumData) {
    const quorumHash = quorumData.hash;
    logger.debug('quorumHash', quorumHash);
    const quorumNodes = quorumData.nodes;
    logger.debug('bls.init');
    bls.init();
    const t = 6;
    const { verificationVector, secretKeyContribution } =
      dkg.generateContribution(bls, quorumNodes.keys(), t);
    logger.debug(verificationVector);
    logger.debug(secretKeyContribution);
    // needs to be saved in kv store
    const kv = new KeyValueStore(config.dashdrive.ipfs.port, quorumHash);
    kv.init();
  },

  // get the averaged pow hash that is used to calculate the quorum
  async getQuorumCalcHash() {
    return new Promise((resolve) => {
      dashcore.getCurrentBlockHeight()
        .then(height => dashcore.getHashFromHeight(qDash.getRefHeight(height)))
        .then((hash) => {
          dashcore.getBlockHeaders(hash, qDash.getPOWAveragingNum())
            .then((headers) => {
              resolve(qDash.getAverageHash(headers));
            });
        });
    });
  },

  async getQuorum() {
    return new Promise((resolve) => {
      Promise.all([
        insight.getMasternodesList(), this.getQuorumCalcHash(), this.getVin(this.pubkey)])
        .then(([list, hash, vin]) => {
          resolve(qDash.getQuorum(list, hash, vin, true));
        });
    });
  },

  async getQuorumForUser(body) {
    return new Promise((resolve) => {
      Promise.all([insight.getMasternodesList(), this.getQuorumCalcHash()])
        .then(([list, hash]) => {
          resolve(qDash.getQuorum(list, hash, body.data.txId));
        });
    });
  },

  async isValidQuorum(body, qTempPort) {
    return new Promise((resolve) => {
      Promise.all([
        insight.getMasternodesList(), this.getQuorumCalcHash(),
        dashcore.getAddress(body.data.txId)])
        .then(([list, hash, addr]) => {
          const quorumData = {
            mnList: list,
            calcHash: hash,
            refAddr: addr,
            vin: this.getVin(this.pubkey),
          };
          // QDEVTEMP - remove qTempPort
          resolve(qDash.validate(body.data, body.signature, quorumData, qTempPort));
        });
    });
  },

  async getVin(pubkey) {
    return new Promise((resolve) => {
      dashcore.getMasternodesList('payee', pubkey)
        .then((res) => {
          resolve(Object.keys(res)[0]);
        });
    });
  },
};

module.exports = quorumService;
