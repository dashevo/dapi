const clearDisconnectedClientBloomFilters =
({ clients, currentTime, hasDisconnectedThresholdInMsec }) => {
  if (!clients.length) {
    return [];
  }

  return clients.filter((client) => {
    if (currentTime - client.lastSeen >= hasDisconnectedThresholdInMsec) {
      client.peer.sendMessage(client.peer.messages.FilterClear(client.filter));
      return false;
    }
    return true;
  });
};

module.exports = { clearDisconnectedClientBloomFilters };
