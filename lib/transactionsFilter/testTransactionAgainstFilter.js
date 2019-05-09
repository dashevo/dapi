const Filter = require('bloom-filter');

/**
 * @param {Buffer} transactionHash
 * @param {Number} inputIndex
 * @returns {Buffer}
 */
function inputIndexToBuffer(transactionHash, inputIndex) {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32LE(inputIndex, 0);
  return Buffer.concat([transactionHash, indexBuffer]);
}

/**
 * @param {Filter} filter
 * @param {Script} script
 * @returns {boolean}
 */
function filterContainsScript(filter, script) {
  const matchIndex = script.chunks.findIndex((chunk) => {
    if (chunk.opcodenum === 0) {
      return false;
    }
    return filter.contains(chunk.buf);
  });
  return matchIndex > -1;
}

/**
 * @param {Filter} filter
 * @param {Transaction} transaction
 * @returns {boolean}
 */
function checkOutputs(filter, transaction) {
  if (Array.isArray(transaction.outputs)) {
    const matchIndex = transaction.outputs.findIndex((output, index) => {
      const isMatchFound = filterContainsScript(filter, output.script);
      const alwaysUpdateFilterOnMatch = filter.nFlags === Filter.BLOOM_UPDATE_ALL;
      const updateFilterOnPubkeyMatch = filter.nFlags === Filter.BLOOM_UPDATE_P2PUBKEY_ONLY;
      const isScriptPubKeyOut = output.script.isPublicKeyOut() || output.script.isMultisigOut();
      const isFilterUpdateNeeded = alwaysUpdateFilterOnMatch
        || (updateFilterOnPubkeyMatch && isScriptPubKeyOut);
      if (isMatchFound && isFilterUpdateNeeded) {
        filter.insert(inputIndexToBuffer(transaction.hash, index));
      }
      return isMatchFound;
    });
    return matchIndex > -1;
  }
  return false;
}

/**
 * @param {Filter} filter
 * @param {Transaction} transaction
 */
function checkInputs(filter, transaction) {
  if (Array.isArray(transaction.inputs)) {
    const matchIndex = transaction.inputs.findIndex((input) => {
      const previousOutput = inputIndexToBuffer(input.prevTxId, input.outputIndex);
      return filter.contains(previousOutput) || filterContainsScript(filter, input.script);
    });
    return matchIndex > -1;
  }
  return false;
}

/**
 * BIP37 transaction filtering
 * @param {Filter} filter
 * @param {Transaction} transaction
 */
function testTransactionAgainstFilter(filter, transaction) {
  return filter.contains(transaction.hash)
    || checkOutputs(filter, transaction)
    || checkInputs(filter, transaction);
}

module.exports = testTransactionAgainstFilter;
