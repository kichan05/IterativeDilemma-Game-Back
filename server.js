const express = require('express');
const WebSocket = require('ws');
const {getRandom} = require("./utlis");
const socketType = require("./socketType");

let rooms = {}

function getRoomData(roomId) {
  return {roomId, users: rooms[roomId].users.map(u => u.name)};
}

function handleRoomCreate(ws) {
  const roomId = getRandom(1001, 9999);

  ws.roomId = roomId;
  ws.isHost = true;
  ws.name = "호스트"
  rooms[roomId] = {roomId, host: ws, users: []};

  ws.send(JSON.stringify({
    type: socketType.ROOM_CREATE_REQ,
    room: getRoomData(roomId),
    name: ws.name
  }))
}

function handleRoomJoin(ws, json) {
  const {roomId, name} = json;

  if (roomId in rooms) {
    ws.roomId = roomId;
    ws.name = name;
    ws.isHost = false;
    rooms[roomId].users.push(ws);

    ws.send(JSON.stringify({
      type: socketType.ROOM_JOIN_SUCCESS,
      room: getRoomData(roomId),
      name: name,
    }))
    const users = rooms[roomId].users;
    [...users, rooms[roomId].host]
      .forEach((client) => {
        client.send(JSON.stringify({
          type: socketType.ROOM_DATA_UPDATE,
          room : getRoomData(roomId),
        }))
      });
  }
}

function handleRTCOffer(json) {
  const roomId = json.roomId;
  rooms[roomId].host.send(JSON.stringify(json));
}

function handleRTCAnswer(json) {
  const roomId = json.roomId;
  const target = rooms[roomId].users.filter(u => u.name = json.name)[0];
  target.send(JSON.stringify(json));
}

function handleICECandidateSend(ws, json) {
  const {roomId, isHost} = ws;
  const room = rooms[roomId]
  const targets = isHost ? room.users : [room.host];

  targets.forEach((u) => {
    u.send(JSON.stringify({
      ...json, type: socketType.ICE_CANDIDATE_RECEIVE
    }))
  })
}

const app = express();

const server = app.listen(8080, () => {
  console.log('Server run at http://localhost:8080');
});

const wss = new WebSocket.Server({server});

wss.on('connection', (ws) => {
  console.log('클라이언트 연결');

  ws.on('message', (message) => {
    const json = JSON.parse(message);
    // let roomId, isHost, targets;

    switch (json.type) {
      case socketType.ROOM_CREATE:
        handleRoomCreate(ws);
        break;
      case socketType.ROOM_JOIN:
        handleRoomJoin(ws, json);
        break
      case socketType.RTC_OFFER:
        handleRTCOffer(json);
        break;
      case socketType.RTC_ANSWER:
        handleRTCAnswer(json);
        break;
      case socketType.ICE_CANDIDATE_SEND:
        handleICECandidateSend(ws, json);
        break;
    }

    ws.on('close', () => {
      console.log('클라이언트가 연결을 종료');
    });
  });
})

app.use(express.static('public'));