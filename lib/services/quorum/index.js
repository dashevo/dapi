const zeromq = require('zeromq');
const qDash = require('quorums-dash');
const dashcore = require('../../api/dashcore');
const config = require('../../config');
const logger = require('../../log');
const insight = require('../../api/insight');

const heartbeatInterval = 10;
const zmqAddress = `tcp://${config.dashcore.rpc.host}:${config.dashcore.zmq.port}`;

let isHeartBeat = false;

const quorumService = {
  start() {
    isHeartBeat = false;
    const zmqTopic = 'hashblock';
    const subscriber = zeromq.socket('sub');
    logger.debug(`- Init Quorum (heartbeat interval = ${heartbeatInterval} blocks)`);
    logger.debug(`- Subscribing to ZMQ ${zmqTopic} on ${zmqAddress}`);
    // TODO: error handling for when dapi is started before MN is synced and therefore fails to connect with zmq

    subscriber.connect(zmqAddress);
    subscriber.subscribe(zmqTopic);

    subscriber.on('message', async (topic, msg) => {
      const hash = msg.toString('hex');
      const height = await dashcore.getCurrentBlockHeight();
      // let's see if we have a new heartbeat and need to migrate/join new quorum
      isHeartBeat = height % heartbeatInterval === 0;
      logger.debug(topic, msg, hash, height, isHeartBeat);
      if (isHeartBeat) {
        // here comes the action!
        this.migrateClients();
        this.joinQuorum();
      }
    });
  },

  migrateClients() {
    logger.debug('migrate connected clients');
    // TODO: whatever we need to migrate our connected clients
  },

  async joinQuorum() {
    logger.debug('join new Quorum');
    // TODO: fix quorum-dash. qDash.getQuorum(quorumData) causes error
    const quorumData = await this.getQuorum();
    logger.debug(quorumData);
  },

  async getQuorumHash() {
    const bestHeight = await dashcore.getCurrentBlockHeight();
    return dashcore.getHashFromHeight(qDash.getRefHeight(bestHeight));
  },

  async getQuorum() {
    const [mnList, refHash] = await Promise.all([insight.getMnList(), this.getQuorumHash()]);
    const quorumData = { mnList, refHash };
    return qDash.getQuorum(quorumData);
  },

  async isValidQuorum(body, qTempPort) {
    const [mnList, refHash, refAddr] = await Promise.all([
      insight.getMnList(), this.getQuorumHash(), insight.getAddress(body.data.txId),
    ]);
    const quorumData = { mnList, refHash, refAddr };
    // QDEVTEMP - remove qTempPort
    return qDash.validate(body.data, body.signature, quorumData, qTempPort);
  },
};
module.exports = quorumService;
