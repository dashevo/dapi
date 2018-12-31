const fetch = require('node-fetch');
const { promisify } = require('util');
const WebSocket = require('ws');
const log = require('../../log');

const startWebSocketsService = async ({ quorumService }) => {
  const wss = new WebSocket.Server();
  wss.on('connection', async (ws) => {
    ws.on('message', async (message) => {
      const payload = JSON.parse(message);
      try {
        const response = await fetch(`http://localhost/${payload.method}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload.params),
        });
        const data = await response.text();
        ws.send(data);
      } catch (error) {
        log.error(error);
      }
    });
  });
};

module.exports = {
  startWebSocketsService,
};
