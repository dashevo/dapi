// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
class Subscriber extends require('./receive_socket') {
  constructor(params) {
    super(params);
  }

  attach() {
    super.attach('sub');
  }
}

module.exports = Subscriber;
