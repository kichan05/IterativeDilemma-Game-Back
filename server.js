const express = require('express');
const WebSocket = require('ws');

const app = express();
const server = app.listen(8080, () => {
  console.log('Server run at http://localhost:8080');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('클라이언트 연결');

  ws.on('message', (message) => {
    console.log('받은 메시지:', message);

    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('클라이언트가 연결을 종료');
  });
});

app.use(express.static('public'));