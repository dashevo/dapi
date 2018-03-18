const qDash = require('quorums-dash');
const dashcore = require('../../api/dashcore/rpc');
const logger = require('../../log');
const insight = require('../../api/insight');
const dkg = require('dkg');
const bls = require('bls-lib');
const mocks = require('../../mocks/mocks');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

const quorumService = {
  start(dashcoreZmqClient) {
    // first create IPFS instance for this dapi node
    const ipfsOptions = {
      EXPERIMENTAL: {
        pubsub: true,
      },
    };
    this.ipfs = new IPFS(ipfsOptions);
    this.ipfs.on('error', (e) => { logger.debug(e); });
    this.ipfs.on('ready', async () => {
      const newBlockEvent = dashcoreZmqClient.topics.hashblock;
      // get pubkey directly from dashcore.rpc in production
      this.pubkey = mocks.node.pubKey;
      logger.debug('Init Quorum');
      logger.debug(`pubkey = ${this.pubkey}`);
      /* TODO: error handling for when dapi is started before MN is
      // synced and therefore fails to connect with zmq
      */
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
    logger.debug(quorumNodes);
    logger.debug('bls.init');
    bls.init();
    const t = 6;
    const { verificationVector, secretKeyContribution } =
      dkg.generateContribution(bls, quorumNodes.keys(), t);
    logger.debug(verificationVector);
    logger.debug(secretKeyContribution);

    // Create a database
    const orbitdb = new OrbitDB(this.ipfs);
    const access = {
      // Give write access to everyone
      write: ['*'],
    };
    const db = await
      orbitdb.keyvalue('87ded00bfb12c6de85107383c0b23949cc9d9034cd13c0f954fade7b3230ca20', access);
    logger.debug('db.address', db.address.toString());
    // Add the vvec to the kvstore
    // TODO: sign vvec so it cannot be tampered with by other MN
    await db.put(this.pubkey, { vvec: verificationVector });
    const vvec = db.get(this.pubkey);
    logger.debug(vvec);
    // TODO: encrypt the skc for the node and add to the kvstor
    await db.put(quorumNodes[0].payee, { skc: secretKeyContribution[0] });
    logger.debug('first', db.get(quorumNodes[0].payee));
    quorumNodes.forEach(function (node, index) {
      logger.debug('put', this[index]);
      db.put(node.payee, { skc: this[index] });
    }, secretKeyContribution);
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
