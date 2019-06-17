const { MerkleBlock, Transaction } = require('@dashevo/dashcore-lib');
const { TransactionsWithProofsResponse } = require('@dashevo/dapi-grpc');

function fetchHistoricalTransactionsFactory(coreRpcApi) {
  async function fetchHistoricalTransactions(
    call,
    filter,
    blockHash,
    count,
  ) {
    const rawMerkleBlocks = await coreRpcApi.getMerkleBlocks(filter, blockHash, count);
    const merkleBlocks = rawMerkleBlocks
      .map(rawMerkleBlock => new MerkleBlock(rawMerkleBlock));
    const transactionHashes = merkleBlocks
      .map(merkleBlock => merkleBlock.getMatchedTransactionHashes());
    const rawTransactionsGroupedByBlock = await Promise.all(transactionHashes
      .map(transactionHash => coreRpcApi.getRawTransaction(transactionHash)));

    const responses = merkleBlocks.map((merkleBlock, merkleBlockIndex) => {
      const response = new TransactionsWithProofsResponse();
      response.setRawMerkleBlock(merkleBlock.toBuffer());
      response.setRawTransactions(
        rawTransactionsGroupedByBlock[merkleBlockIndex].map(
          rawTransaction => new Transaction(rawTransaction).toBuffer(),
        ),
      );
      return response;
    });

    responses.forEach(response => call.write(response.toObject()));
  }

  return fetchHistoricalTransactions;
}

module.exports = fetchHistoricalTransactionsFactory;
