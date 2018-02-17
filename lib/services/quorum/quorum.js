// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const qDash = require('quorums-dash');
const { Schema } = require('@dashevo/dash-schema/lib').Consensus;
const { verbs } = require('../../constants/index');
const zeromq = require('zeromq');
const dashcore = require('../../api/dashcore');
const heartbeat_interval = 10;

class Quorum {
  constructor(app) {
    this.logger = app.logger;
    this.logger.debug('- Init Quorum (heartbeat interval = ' + heartbeat_interval + ' blocks)');
    this.insight = app.insight;
    this.zmq_address = 'tcp://' + app.config.dashcore.rpcClient.host + ':' + app.config.dashcore.zmq.port;
    this.subscribe();
  }

  subscribe() {
      this.is_heartbeat = false;
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
                  this.is_heartbeat = height % heartbeat_interval === 0;
                  this.logger.debug(topic, msg, hash, height, this.is_heartbeat);
                  if (this.is_heartbeat) {
                      //here comes the action! TODO: handover, new Quorum
                      this.logger.debug('migrate Quorum');
                      this.logger.debug('get new Quorum');
                      //TODO: fix quorum-dash. qDash.getQuorum(quorumData) causes error
                      this.getQuorum()
                          .then((quorumData) => {
                              this.logger.debug(quorumData);
                          });
                  }
              })
      })
  }

  getQuorumHash() {
      return new Promise((resolve, reject) => {
          dashcore.getCurrentBlockHeight()
              .then(height => dashcore.getHashFromHeight(qDash.getRefHeight(height)))
              .then((hash) => {
                  resolve(hash);
              });
      });
  }

  getQuorum() {
      return new Promise((resolve, reject) => {
          Promise.all([this.insight.getMnList(), this.getQuorumHash()])
              .then(([list, hash]) => {
                  const quorumData = {
                      mnList: list,
                      refHash: hash
                  };
                  resolve(qDash.getQuorum(quorumData));
              });
      });
  }

  isValidQuorum(body, qTempPort) {
    return new Promise((resolve, reject) => {
      Promise.all([this.insight.getMnList(), this.getQuorumHash(), this.insight.getAddress(body.data.txId)])
        .then(([list, hash, addr]) => {
          const quorumData = {
            mnList: list,
            refHash: hash,
            refAddr: addr,
          };

          resolve(qDash.validate(body.data, body.signature, quorumData, qTempPort)); // //QDEVTEMP - remove qTempPort
        });
    });
  }

  getQuorumFailedResponse() {
    this.logger.debug('Invalid Quorum! - Signature invalid or invalid node for handling request ');
    return { response: 'Failed' };
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
