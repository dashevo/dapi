const {
  v0: {
    GetStatusResponse,
  },
} = require('@dashevo/dapi-grpc');

const getStatusHandlerFactory = require('../../../../../lib/grpcServer/handlers/core/getStatusHandlerFactory');

const GrpcCallMock = require('../../../../../lib/test/mock/GrpcCallMock');

describe('getStatusHandlerFactory', () => {
  let call;
  let getStatusHandler;
  let coreRPCClientMock;
  let info;

  beforeEach(function beforeEach() {
    info = {
      bestBlockHash: '0000020029bcac549a6e7b7e488d9ca8af518d4c0aae8073cd364c70ca29be6e',
      blocks: 1185683,
      chain: 'livenet',
      difficulty: 184564887.5403167,
      version: 140001,
      protocolVersion: 70215,
      subVersion: 70215,
      timeoffset: 0,
      connections: 8,
      relayfee: 0.00001,
      warnings: '',
    };

    call = new GrpcCallMock(this.sinon);

    coreRPCClientMock = {
      getStatus: this.sinon.stub().resolves({ info }),
    };

    getStatusHandler = getStatusHandlerFactory(coreRPCClientMock);
  });

  it('should return valid result', async () => {
    const result = await getStatusHandler(call);

    expect(result).to.be.an.instanceOf(GetStatusResponse);

    expect(result.getCoreVersion()).to.equal(info.version);
    expect(result.getProtocolVersion()).to.equal(info.protocolVersion);
    expect(result.getSubVersion()).to.equal(info.subVersion);
    expect(result.getBlocks()).to.equal(info.blocks);
    expect(result.getBestBlockHash()).to.equal(info.bestBlockHash);
    expect(result.getTimeOffset()).to.equal(info.timeoffset);
    expect(result.getConnections()).to.equal(info.connections);
    expect(result.getDifficulty()).to.equal(info.difficulty);
    expect(result.getRelayFee()).to.equal(info.relayfee);
    expect(result.getWarnings()).to.equal(info.warnings);
    expect(result.getChain()).to.equal(info.chain);

    expect(coreRPCClientMock.getStatus).to.be.calledOnceWith('getInfo');
  });
});
