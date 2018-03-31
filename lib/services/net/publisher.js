// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
class Publisher extends require('./send_socket') {
  constructor(params) {
    super(params);
  }

  attach() {
    super.attach('pub');
  }
}

module.exports = Publisher;
