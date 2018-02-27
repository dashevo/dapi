// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const dkg = require('dkg');
const bls = require('bls-lib');
const qDash = require('quorums-dash');
const { Schema } = require('@dashevo/dash-schema/lib').Consensus;
const { verbs } = require('../../constants/index');
const zeromq = require('zeromq');
const dashcore = require('../../api/dashcore');
const insight = require('../../api/insight');

class Quorum {
  constructor(app) {
    this.logger = app.logger;
    this.logger.debug('- Init Quorum');
    this.pubkey = app.config.node.pubKey;
    this.logger.debug('- pubkey = ' + this.pubkey);
    //TODO: error handling for when dapi is started before MN is synced and therefore fails to connect with zmq (use dashcore.getBestBlockHash and dashcore.getBlockchainInfo)

    this.zmq_address = 'tcp://' + app.config.dashcore.rpcClient.host + ':' + app.config.dashcore.zmq.port;
    this.subscribe();
  }

  subscribe() {
      const zmq_topic = 'hashblock';
      const subscriber = zeromq.socket('sub');
      this.logger.debug('- Subscribing to ZMQ ' + zmq_topic + ' on ' + this.zmq_address);
      subscriber.connect(this.zmq_address);
      subscriber.subscribe(zmq_topic);
      subscriber.on('message', (topic, msg) => {
          let hash = msg.toString('hex');
          dashcore.getCurrentBlockHeight()
              .then((height) => {
                  //let's see if we have a new heartbeat and need to migrate/join new quorum
                  let is_heartbeat = height % qDash.config.heartbeat_interval === 0;
                  if (is_heartbeat) {
                      //here comes the action!
                      this.informClients();
                      this.migrateClients();
                      this.joinQuorum();
                  }
              })
      })
  }

  informClients() {
      this.logger.debug('inform connected clients about heartbeat');
      //TODO: whatever we need to inform our connected clients
  }

  migrateClients() {
      this.logger.debug('migrate connected clients');
      //TODO: whatever we need to migrate our connected clients. Like grant db access to new quorums etc.
  }

  joinQuorum() {
      this.logger.debug('join new Quorum');
      this.getQuorum()
          .then((quorumData) => {
              const quorumHash = quorumData.hash;
              this.logger.debug('quorumHash', quorumHash);
              const quorumNodes = quorumData.nodes;
              for (let node of quorumNodes) {
                  if (node) {
                      this.logger.debug(node);
                  }
              }
              this.dkg(quorumNodes);
          });
  }

  dkg(quorumNodes) {
      this.logger.debug('bls.init');
    bls.init();
    const threshold = 6;
    const {verificationVector, secretKeyContribution} = dkg.generateContribution(bls, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], threshold)
    this.logger.debug(verificationVector);
    //needs to be saved in kv store

    this.logger.debug(secretKeyContribution);
    //needs to be encrypted and saved in kv store
  }

  //get the averaged pow hash that is used to calculate the quorum
  getQuorumCalculationHash() {
      return new Promise((resolve, reject) => {
          dashcore.getCurrentBlockHeight()
              .then(height => dashcore.getHashFromHeight(qDash.getRefHeight(height)))
              .then((hash) => {
                  dashcore.getBlockHeaders(hash, qDash.config.POWAveragingNum)
                      .then((headers)=> {
                          resolve(qDash.getAverageHash(headers));
                  });
              });
      });
  }

  getQuorum() {
      return new Promise((resolve, reject) => {
          Promise.all([insight.getMasternodesList(), this.getQuorumCalculationHash(), this.getVin(this.pubkey)])
              .then(([list, hash, vin]) => {
                  this.logger.debug(hash);
                  this.logger.debug(vin);
                  resolve(qDash.getQuorum(list, hash, vin, true));
              });
      });
  }

  getQuorumForUser(body) {
    return new Promise((resolve, reject) => {
        Promise.all([dashcore.getMasternodesList(), this.getQuorumCalculationHash()])
            .then(([list, hash]) => {
                resolve(qDash.getQuorum(list, hash, body.data.txId));
            });
    });
  }

  isValidQuorum(body, qTempPort) {
    return new Promise((resolve, reject) => {
      Promise.all([dashcore.getMasternodesList(), this.getQuorumCalculationHash(), dashcore.getAddress(body.data.txId)])
        .then(([list, hash, addr]) => {
          const quorumData = {
            mnList: list,
            calcHash: hash,
            refAddr: addr,
            vin: this.getVin(this.pubkey)
          };

          resolve(qDash.validate(body.data, body.signature, quorumData, qTempPort)); // //QDEVTEMP - remove qTempPort
        });
    });
  }

  getQuorumFailedResponse() {
    this.logger.debug('Invalid Quorum! - Signature invalid or invalid node for handling request ');
    return { response: 'Failed' };
  }

  //get MN outpoint (vin)
  getVin(pubkey) {
      return new Promise((resolve, reject) => {
          dashcore.getMasternodesList('payee', pubkey)
              .then((res) => {
                  resolve(Object.keys(res)[0]);
              })
      });
  }

  performAction(type, val) {
    this.logger.debug('Quorum - Received action ', type, val);
    switch (type) {
      case 'add':
        return this.addObject(val);
      case 'commit':
        return this.commitObject(val);
      case 'remove':
        return this.removeObject(val);
      case 'state':
        return this.getState(val);
      case 'listen':
        return this.listenForeignKey(val);
      case 'migrate':
        return this.migrateState(val);
      case 'auth':
        return this.authenticate(val);
      case 'schema':
        return this.create(val);
      default:
        return `Not Implemented - PerformAction ${type}`;
    }
  }
  create(value) {
    if (value.verb === verbs.CREATE && !Schema.validate(value)) {
    	// TODO: check this stuff with Alex
      throw new Error('Schema is not valid');
    }
  }
  addObject(value) {
    return { response: 'Added' };
  }
  commitObject(value) { return { response: 'Commited' }; }
  removeObject(value) { return { response: 'Removed' }; }
  getState(value) { return { response: 'Getted' }; }
  listenForeignKey(value) { return { response: 'Listened' }; }
  migrateState(value) { return { response: 'Migrated' }; }
  authenticate(value) { return { response: 'Authenticated' }; }
}
module.exports = Quorum;
