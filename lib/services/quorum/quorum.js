// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
const qDash = require('quorums-dash');
const { Schema } = require('@dashevo/dash-schema/lib').Consensus;
const { verbs } = require('../../constants/index');
const zeromq = require('zeromq');
const dashcore = require('../../api/dashcore');
const heartbeat_interval = 2;
let blockhash = '';
let is_handover = false;

class Quorum {
  constructor(app) {
    this.logger = app.logger;
    this.logger.debug('- Init Quorum');
    this.insight = app.insight;

    const zmq_address = 'tcp://127.0.0.1:28332';
    const zmq_topic = 'hashblock';
    const subscriber = zeromq.socket('sub');

    subscriber.connect(zmq_address);
    subscriber.subscribe(zmq_topic);

    subscriber.on('message', (topic, msg) => {
        blockhash = msg.toString('hex');
        dashcore.getCurrentBlockHeight()
            .then((height) => {
                is_handover = height % heartbeat_interval === 0;
                console.log('%s %s %s %s %s', topic, msg, blockhash, height, is_handover);
            })
      })
  }

  //*** to be removed ***
  getQuorumHash() {
    return new Promise((resolve, reject) => {
      this.insight.getCurrentBlockHeight()
        .then(height => this.insight.getHashFromHeight(qDash.getRefHeight(height)))
        .then((hash) => {
          resolve(hash);
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

  getQuroumFailedResponse() {
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
