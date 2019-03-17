class QuorumService {
  constructor({
    coreRPCClient, coreZMQClient, log, heartbeatInterval = 10,
  }) {
    this.coreRPCClient = coreRPCClient;
    this.coreZMQClient = coreZMQClient;
    this.log = log;
    this.heartbeatInterval = heartbeatInterval;
    this.isHeartBeat = false;
  }

  start() {
    const {
      log, coreRPCClient, coreZMQClient, heartbeatInterval,
    } = this;
    const newBlockEvent = coreZMQClient.topics.hashblock;
    this.isHeartBeat = false;
    log.debug(`- Init Quorum (heartbeat interval = ${heartbeatInterval} blocks)`);
    /* TODO: error handling for when dapi is started before MN is
    synced and therefore fails to connect with zmq */

    coreZMQClient.on(newBlockEvent, async (msg) => {
      const hash = msg.toString('hex');
      const height = await coreRPCClient.getBestBlockHeight();
      // let's see if we have a new heartbeat and need to migrate/join new quorum
      this.isHeartBeat = height % heartbeatInterval === 0;
      log.debug(newBlockEvent, msg, hash, height, this.isHeartBeat);
      if (this.isHeartBeat) {
        this.migrateClients();
        this.joinQuorum();
      }
    });
  }

  migrateClients() {
    this.log.debug('migrate connected clients');
  }

  async joinQuorum() {
    this.log.debug('join new Quorum');
  }
}

module.exports = QuorumService;
