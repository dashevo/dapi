// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
class Replier extends require('./send_socket') {
  constructor(params) {
    super(params);
  }

  attach() {
    super.attach('rep');
  }
}

module.exports = Replier;
