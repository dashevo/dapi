const jayson = require('jayson');
const { User, Transition, State } = require('dash-schema/lib').Consensus;

const mockedData = {
  user: {
    uname: '',
    regtxid: 'ef6ab42e001144bfbaf4777b05148f56a9705b63cdc320c95171bc600df7088e',
    pubkey: '024964f06ea5cfec1890d7e526653b083c12360f79164c1e8163327d0849fa7bca',
    credits: 100000,
    subtx: [],
  },
  transition: {},
};

// All methods are async because when we remove mocks there will be network calls
const dashrpc = {
  async getUser(username) {
    if (!User.validateUsername(username)) {
      throw new Error('Username is not valid');
    }
    const user = Object.assign({}, mockedData.user);
    user.uname = username;
    return user;
  },
  async sendRawTransition(transitionData) {
    if (!Transition.validate(transitionData)) {
      throw new Error('Transition data is not valid');
    }
    return State.getTSID(transitionData);
  },
  async createUser(userData) {
    return mockedData.user;
  },
};

const server = jayson.server({
  async getUser(args, callback) {
    const username = args[0];
    try {
      const user = await dashrpc.getUser(username);
      return callback(null, user);
    } catch (e) {
      return callback(e);
    }
  },
  async createUser(args, callback) {
    try {
      const user = await dashrpc.createUser();
      return callback(null, user);
    } catch (e) { return callback(e); }
  },
});

server.http().listen(4019);
