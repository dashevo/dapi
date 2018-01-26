// TODO: Address ESLint issues the next time this file is edited
/* eslint-disable */
class PairResponder extends require('./send_socket') {
  constructor(params) {
    super(params);
  }

  attach() {
    super.attach('pair');
  }
}

module.exports = PairResponder;
