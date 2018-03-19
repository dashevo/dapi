const qDash = require('quorums-dash');
const dashcore = require('../../api/dashcore/rpc');
const logger = require('../../log');
const insight = require('../../api/insight');
const dkg = require('dkg');
const bls = require('bls-lib');
const mocks = require('../../mocks/mocks');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

let secretKeyShare = '';
let quorumPublicKey = '';
const threshold = 6;

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
      bls.init();
      logger.debug('bls.init');
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
    secretKeyShare = '';
    quorumPublicKey = '';
    const quorumData = await this.getQuorum();
    this.dkg(quorumData);
    // waiting for keys...
    // TODO: make waiting for OrbitDB events promise based somehow
    const wait = setInterval(() => {
      if (secretKeyShare !== '') {
        clearInterval(wait);
        // ready to sign
        const sig = bls.signature();
        bls.sign(sig, secretKeyShare, 'Hello world');
        logger.debug('qpk', quorumPublicKey);
        logger.debug('sig', sig);
        bls.free(sig);
      }
    }, 500);
  },

  async collectSecretKeyContributions(db, quorumNodes) {
    const receivedShares = [];
    db.events.on('replicated', async () => {
      const result = db.iterator({ limit: -1 }).collect().map(e => e.payload.value);
      logger.debug('replicated', result.join('\n'));
      // when a quorum member receives its share, it verifies it against the
      // verification vector of the sender and then stores it
      // First check if incoming msg is a skc. If yes get vvec of sending quorum node
      if (result.skc) {
        const sender = quorumNodes[result.id].payee;
        const verified = dkg.verifyContributionShare(bls, result.id, result.skc, await db.get(`${sender} + '-vvec'`));
        if (!verified) {
          throw new Error('invalid share! Punish the criminal node!');
        }
        receivedShares.push(result.skc);
        if (receivedShares.length >= threshold) {
          const sk = dkg.addContributionShares(bls, receivedShares);
          // Now anyone can add together the all verification vectors posted by the
          // members of the quorum to get a single verification vector for the quorum
          const vvecs = [];
          quorumNodes.forEach(async (node) => {
            vvecs.push(await db.get(`${node.payee} + '-vvec'`));
          });
          const quorumVvec = dkg.addVerificationVectors(bls, vvecs);

          // the quorum's verification vector contains the quorum's public key. The quorum's
          // public key is the first element in the array
          const qpk = quorumVvec[0];
          secretKeyShare = sk;
          quorumPublicKey = qpk;
        }
      }
    });
  },

  async dkg(quorumData) {
    const quorumHash = quorumData.hash;
    logger.debug('quorumHash', quorumHash);
    const quorumNodes = quorumData.nodes;
    logger.debug(quorumNodes);
    const { verificationVector, secretKeyContribution } =
      dkg.generateContribution(bls, quorumNodes.keys(), threshold);
    logger.debug(verificationVector);
    logger.debug(secretKeyContribution);
    // Create a database
    const orbitdb = new OrbitDB(this.ipfs);
    const access = {
      // Give write access to everyone for the time being
      write: ['*'],
    };
    const db = await orbitdb.keyvalue(quorumHash, access);
    // the db's address will need to be shared with
    // quorum members for replication
    logger.debug('db.address', db.address.toString());
    this.collectSecretKeyContributions(db, quorumNodes);

    // put the my vvec to the kvstore
    // TODO: sign vvec so it cannot be tampered with by other MN
    await db.put(`${this.pubkey} + '-vvec'`, { vvec: verificationVector });

    // put a skc for every quorum member
    // TODO: encrypt the skc for the node
    quorumNodes.forEach(function (node, index) {
      db.put(`${node.payee} + '-skc'`, { skc: this[index], id: index });
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
