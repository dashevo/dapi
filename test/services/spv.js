const assert = require('assert');
const { spvService } = require('../../lib/services/corep2p');
const { getCorrectedHash } = require('../../lib/utils');

// Todo: move to utils tests
describe('getCorrectedHash', () => {
  it('should return a corrected reversed hash object', () => {
    const buffer =
      Buffer.from([
        0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      ]);
    const expected = '0101010101010101010101010101010101010101010101010101010101010100';
    const actual = getCorrectedHash(buffer);
    assert.equal(actual, expected);
  });
});

describe('SPV', () => {
  describe('clearDisconnectedClientBloomFilters', () => {
    it('should return an empty array when the incoming clients array is empty', () => {
      const expected = [];
      const actual = spvService.clearDisconnectedClientBloomFilters({ clients: [] });
      assert.deepEqual(actual, expected);
    });
    it('should return the list of clients remaining after removing those that have timed out', () => {
      const client = lastSeen => ({
        filter: 'filter',
        peer: { messages: { FilterClear: () => {} }, sendMessage: () => { } },
        lastSeen,
      });
      const currentTime = new Date(1529427556922);
      const hasDisconnectedThresholdInMsec = 60000;
      const clients = [
        client(new Date(currentTime.getTime() - hasDisconnectedThresholdInMsec)),
        client(currentTime),
        client(new Date(currentTime - (hasDisconnectedThresholdInMsec + 1))),
      ];
      const expected = [client(currentTime)];
      const actual =
      spvService.clearDisconnectedClientBloomFilters({
        clients, currentTime, hasDisconnectedThresholdInMsec,
      });
      // TODO: How do you get assert to compare nested arrays correctly?
      assert.deepEqual(actual[0].filter, expected[0].filter);
    });
  });
});
