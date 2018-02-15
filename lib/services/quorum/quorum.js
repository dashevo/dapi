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
    this.logger.debug('- Init Quorum');
    this.insight = app.insight;
    this.blockhash = '';
    this.is_handover = false;
    this.init();
  }

  init() {
      this.logger.debug('Subscribing ZMQ...');
      const zmq_address = 'tcp://127.0.0.1:28332';
      const zmq_topic = 'hashblock';
      const subscriber = zeromq.socket('sub');
      this.getQuorumHash()
          .then((hash) => {
              this.blockhash = hash;
              this.getCurrentBlockHeight()
                  .then((height) => {
                      console.log('%s %s', this.blockhash, height );
                  });
              subscriber.connect(zmq_address);
              subscriber.subscribe(zmq_topic);
              subscriber.on('message', (topic, msg) => {
                  this.blockhash = msg.toString('hex');
                  this.getCurrentBlockHeight()
                      .then((height) => {
                          //let's see if we have a new heartbeat and need to handover
                          this.is_handover = height % heartbeat_interval === 0;
                          console.log('%s %s %s %s %s', topic, msg, this.blockhash, height, this.is_handover);
                      })
              })
          });
  }

  getQuorumHash() {
      return new Promise((resolve, reject) => {
          if (this.blockhash === '') {
              this.getCurrentBlockHeight()
                  .then(height => {
                      dashcore.getHashFromHeight(qDash.getRefHeight(height))
                          .then((hash) => {
                              resolve(hash);
                          });
                  })
          } else {
              resolve(this.blockhash);
          }
      });
  }

  getCurrentBlockHeight() {
      return new Promise((resolve, reject) => {
          dashcore.getCurrentBlockHeight()
              .then(height => {
                  resolve(height);
              })
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
