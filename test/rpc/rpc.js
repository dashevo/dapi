let rpcComm = require('../../lib/rpc')

it('should get final balance', (done) => {
    return rpcComm.getBalance(['ydo8pdZQKuVGjoRwAg4ngZ4sSh67zMizYA'], function (err, res) {
        console.log(res.result)
    })
    done();
})

