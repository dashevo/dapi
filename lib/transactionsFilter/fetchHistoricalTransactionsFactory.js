function fetchHistoricalTransactionsFactory(coreApi) {
  async function fetchHistoricalTransactions(
    call,
    filter,
    blockHash,
    count,
    coreAPI,
    callback,
  ) {


    const merkleBlocks = await coreAPI.getMerkleBlocks(filter.toBuffer().toString('hex'), blockHash, count);
  }

  return fetchHistoricalTransactions;
}
