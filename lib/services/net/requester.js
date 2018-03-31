// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
class Requester extends require('./receive_socket') {
  constructor(params) {
    super(params);
  }

  attach() {
    super.attach('req');
  }
}

module.exports = Requester;
