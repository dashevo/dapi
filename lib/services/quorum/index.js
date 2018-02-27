// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const zeromq = require('zeromq');
const qDash = require('quorums-dash');
const dc = require('../../api/dashcore');
const config = require('../../config');
const logger = require('../../log');
const insight = require('../../api/insight');
const dkg = require('dkg');
const bls = require('bls-lib');

const zmqAddress = `tcp://${config.dashcore.rpc.host}:${config.dashcore.zmq.port}`;

const quorumService = {
  start() {
    this.pubkey = config.node.pubKey;
    const zmqTopic = 'hashblock';
    const subscriber = zeromq.socket('sub');
    logger.debug('Init Quorum');
    logger.debug(`Subscribing to ZMQ ${zmqTopic} on ${zmqAddress}`);
    logger.debug(`pubkey = ${this.pubkey}`);
    /* TODO: error handling for when dapi is started before MN is
    synced and therefore fails to connect with zmq */

    subscriber.connect(zmqAddress);
    subscriber.subscribe(zmqTopic);

    subscriber.on('message', async (topic, msg) => {
      const hash = msg.toString('hex');
      const height = await dc.getCurrentBlockHeight();

      // let's see if we have a new heartbeat and need to migrate/join new quorum
      const isHeartBeat = height % qDash.config.heartbeat_interval === 0;
      logger.debug(topic, msg, hash, height, isHeartBeat);
      if (isHeartBeat) {
        // here comes the action!
        this.informClients();
        this.migrateClients();
        this.joinQuorum();
      }
    });
  },

  informClients() {
    logger.debug('inform connected clients about heartbeat');
    // TODO: whatever we need to inform our connected clients
  },

  migrateClients() {
    logger.debug('migrate connected clients');
    // TODO: whatever we need to migrate our connected clients
  },

  async joinQuorum() {
    logger.debug('join new Quorum');
    this.getQuorum()
      .then((quorumData) => {
        const quorumHash = quorumData.hash;
        logger.debug('quorumHash', quorumHash);
        const quorumNodes = quorumData.nodes;
        this.dkg(quorumNodes);
      });
  },

  async dkg(quorumNodes) {
    logger.debug(JSON.stringify(quorumNodes));
    logger.debug('bls.init');

    bls.init();
    const t = 6;
    const { verificationVector, secretKeyContribution } = dkg.generateContribution(bls, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], t);
    logger.debug(verificationVector);
    // needs to be saved in kv store

    logger.debug(secretKeyContribution);
    // needs to be encrypted and saved in kv store
  },

  // get the averaged pow hash that is used to calculate the quorum
  async getQuorumCalcHash() {
    return new Promise((resolve, reject) => {
      dc.getCurrentBlockHeight()
        .then(height => dc.getHashFromHeight(qDash.getRefHeight(height)))
        .then((hash) => {
          dc.getBlockHeaders(hash, qDash.config.POWAveragingNum)
            .then((headers) => {
              resolve(qDash.getAverageHash(headers));
            });
        });
    });
  },

  async getQuorum() {
    return new Promise((resolve, reject) => {
      Promise.all([
        insight.getMasternodesList(), this.getQuorumCalcHash(), this.getVin(this.pubkey)])
        .then(([list, hash, vin]) => {
          resolve(qDash.getQuorum(list, hash, vin, true));
        });
    });
  },

  async getQuorumForUser(body) {
    return new Promise((resolve, reject) => {
      Promise.all([insight.getMasternodesList(), this.getQuorumCalcHash()])
        .then(([list, hash]) => {
          resolve(qDash.getQuorum(list, hash, body.data.txId));
        });
    });
  },

  async isValidQuorum(body, qTempPort) {
    return new Promise((resolve, reject) => {
      Promise.all([
        insight.getMasternodesList(), this.getQuorumCalcHash(), dc.getAddress(body.data.txId)])
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
    return new Promise((resolve, reject) => {
      dc.getMasternodesList('payee', pubkey)
        .then((res) => {
          resolve(Object.keys(res)[0]);
        });
    });
  },
};
module.exports = quorumService;
