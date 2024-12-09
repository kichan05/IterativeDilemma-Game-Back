const express = require('express');
const WebSocket = require('ws');
const {getRandom} = require("./utlis");
const socketType = require("./socketType");

let rooms = {}

const app = express();

const server = app.listen(8080, () => {
  console.log('Server run at http://localhost:8080');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('클라이언트 연결');

  ws.on('message', (message) => {
    const json = JSON.parse(message);

    if(json.type === socketType.ROOM_CREATE) {
      const roomId = getRandom(1001, 9999);

      rooms[roomId] = [];
      ws.roomId = roomId;
      rooms[roomId].push(ws);

      console.log("방 생성 요청 끗", roomId)

      ws.send(JSON.stringify({
        type: socketType.ROOM_CREATE_REQ,
        roomId,
      }))
    }
    // wss.clients.forEach((client) => {
    //   if (client !== ws && client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
  });

  ws.on('close', () => {
    console.log('클라이언트가 연결을 종료');
  });
});

app.use(express.static('public'));