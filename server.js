const express = require('express');
const WebSocket = require('ws');
const {getRandom} = require("./utlis");
const socketType = require("./socketType");

let rooms = {}

const app = express();

const server = app.listen(8080, () => {
  console.log('Server run at http://localhost:8080');
});

const wss = new WebSocket.Server({server});

wss.on('connection', (ws) => {
  console.log('클라이언트 연결');

  ws.on('message', (message) => {
    const json = JSON.parse(message);
    let roomId

    switch (json.type) {
      case socketType.ROOM_CREATE:
        roomId = getRandom(1001, 9999);

        ws.roomId = roomId;
        ws.name = "호스트"
        rooms[roomId] = {roomId, host: ws, users: []};

        console.log("방 생성 요청 끗", rooms);

        ws.send(JSON.stringify({
          type: socketType.ROOM_CREATE_REQ,
          room: {roomId, users: rooms[roomId].users.map(u => u.name)},
          name: ws.name
        }))
        break;
      case socketType.ROOM_JOIN:
        roomId = json.roomId;
        const name = json.name;
        if (roomId in rooms) {
          console.log(`${name}이(가) ${roomId}방에 가입했습니다.`)
          ws.roomId = roomId;
          ws.name = name;
          rooms[roomId].users.push(ws);

          ws.send(JSON.stringify({
            type: socketType.ROOM_JOIN_SUCCESS,
            room: {roomId, users: rooms[roomId].users.map(u => u.name)},
            name: name,
          }))
          rooms[roomId].users.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: socketType.ROOM_DATA_UPDATE,
                room: {roomId, users: rooms[roomId].users.map(u => u.name)}
              }))
            }
          });

          rooms[roomId].host.send(JSON.stringify({
            type: socketType.ROOM_DATA_UPDATE,
            room: {roomId, users: rooms[roomId].users.map(u => u.name)}
          }))
        }
        break
      case socketType.RTC_OFFER:
        roomId = json.roomId;
        rooms[roomId].send(message);
        break;
      case socketType.RTC_ANSWER:
        roomId = json.roomId;
          //todo 유저가 없을경우 예외처리
        rooms[roomId].users.map(u => u.name = json.name)[0].send(message);
        break;
    }

    ws.on('close', () => {
      // rooms[ws.roomId].remove(ws);
      console.log('클라이언트가 연결을 종료');
    });
  });
})

app.use(express.static('public'));