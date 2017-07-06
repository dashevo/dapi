const SocketBase = require('./socketbase')

class PairResponder extends SocketBase {
    constructor(params) {
        super(params)
    }

    attach() {
        super.attach()
        this.socket.bind(this.uri)
    }
}

module.exports = PairResponder