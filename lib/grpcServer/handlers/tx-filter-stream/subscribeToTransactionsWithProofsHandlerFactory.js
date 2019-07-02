const { BloomFilter } = require('@dashevo/dashcore-lib');
const { TransactionsWithProofsResponse, RawTransactions } = require('@dashevo/dapi-grpc');

const AcknowledgingWritable = require('../../../utils/AcknowledgingWritable');

const ProcessMediator = require('../../../transactionsFilter/ProcessMediator');

const InvalidArgumentError = require('../../error/InvalidArgumentError');

/**
 * Prepare the response and send transactions response
 *
 * @param {AcknowledgingWritable} call
 * @param {Transaction[]} transactions
 * @returns {Promise<void>}
 */
async function sendTransactionsResponse(call, transactions) {
  const rawTransactions = new RawTransactions();

  rawTransactions.setTransactionsList(
    transactions.map(tx => tx.toBuffer()),
  );

  const response = new TransactionsWithProofsResponse();
  response.setRawTransactions(rawTransactions);

  await call.write(response.toObject());
}

/**
 * Prepare the response and send merkle block response
 *
 * @param {AcknowledgingWritable} call
 * @param {MerkleBlock} merkleBlock
 * @returns {Promise<void>}
 */
async function sendMerkleBlockResponse(call, merkleBlock) {
  const response = new TransactionsWithProofsResponse();
  response.setRawMerkleBlock(merkleBlock.toBuffer());

  await call.write(response.toObject());
}

/**
 *
 * @param {getHistoricalTransactionsIterator} getHistoricalTransactionsIterator
 * @param {subscribeToNewTransactions} subscribeToNewTransactions
 * @param {BloomFilterEmitterCollection} bloomFilterEmitterCollection
 * @param {testFunction} testTransactionAgainstFilter
 * @param {CoreRpcClient} coreAPI
 * @return {subscribeToTransactionsWithProofsHandler}
 */
function subscribeToTransactionsWithProofsHandlerFactory(
  getHistoricalTransactionsIterator,
  subscribeToNewTransactions,
  bloomFilterEmitterCollection,
  testTransactionAgainstFilter,
  coreAPI,
) {
  /**
   * @typedef subscribeToTransactionsWithProofsHandler
   * @param {grpc.ServerWriteableStream<TransactionsWithProofsRequest>} call
   * @param {function(Error, Object)} callback
   */
  async function subscribeToTransactionsWithProofsHandler(call, callback) {
    const {
      bloomFilter,
      fromBlockHash,
      fromBlockHeight,
      count,
    } = call.request;

    // Create a new bloom filter emitter when client connects
    let filter;
    try {
      filter = new BloomFilter(bloomFilter);
    } catch (e) {
      const grpcError = new InvalidArgumentError(`Invalid bloom filter: ${e.message}`);

      callback(grpcError, null);

      return;
    }

    if (!fromBlockHash && !fromBlockHeight) {
      const grpcError = new InvalidArgumentError('Either fromBlockHash or fromBlockHeight should be specified');

      callback(grpcError, null);

      return;
    }

    const isNewTransactionsRequested = count === 0;
    let blockHash = fromBlockHash;
    if (fromBlockHeight) {
      const bestHeight = await coreAPI.getBestBlockHeight();

      if (fromBlockHeight > bestHeight) {
        const grpcError = new InvalidArgumentError('fromBlockHeight is bigger than block count');

        callback(grpcError, null);

        return;
      }

      blockHash = await coreAPI.getBlockHash(fromBlockHeight);
    }

    if (count > 0) {
      const block = await coreAPI.getBlock(blockHash);
      const bestBlockHeight = await coreAPI.getBestBlockHeight();

      if (block.height + count > bestBlockHeight) {
        const grpcError = new InvalidArgumentError(
          'count is too big, could not fetch more than blockchain length',
        );

        callback(grpcError, null);

        return;
      }
    }

    const acknowledgingCall = new AcknowledgingWritable(call);
    const mediator = new ProcessMediator();

    if (isNewTransactionsRequested) {
      subscribeToNewTransactions(
        mediator,
        filter,
        testTransactionAgainstFilter,
        bloomFilterEmitterCollection,
      );
    }

    const historicalDataIterator = getHistoricalTransactionsIterator(
      filter,
      blockHash,
      count,
    );

    for await (const { merkleBlock, transactions } of historicalDataIterator) {
      await sendTransactionsResponse(acknowledgingCall, transactions);
      await sendMerkleBlockResponse(acknowledgingCall, merkleBlock);

      if (isNewTransactionsRequested) {
        // removing sent transactions and blocks from cache
        mediator.emit(ProcessMediator.EVENTS.HISTORICAL_BLOCK_SENT, merkleBlock.header.hash);
      }

      // TODO: add timeouts between calls
    }

    if (isNewTransactionsRequested) {
      // notify new txs listener that we've sent historical data
      mediator.emit(ProcessMediator.EVENTS.HISTORICAL_DATA_SENT);

      // new txs listener will send us unsent cached data back
      mediator.on(
        ProcessMediator.EVENTS.TRANSACTION,
        tx => sendTransactionsResponse(acknowledgingCall, [tx]),
      );
      mediator.on(
        ProcessMediator.EVENTS.MERKLE_BLOCK,
        merkleBlock => sendMerkleBlockResponse(acknowledgingCall, merkleBlock),
      );
    }

    // handle case when client disconnected
    call.on('cancelled', () => {
      call.end();

      // remove bloom filter emitter
      mediator.emit(ProcessMediator.EVENTS.CLIENT_DISCONNECTED);

      callback(null, null);
    });
  }

  return subscribeToTransactionsWithProofsHandler;
}

module.exports = subscribeToTransactionsWithProofsHandlerFactory;
