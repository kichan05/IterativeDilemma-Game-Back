const express = require('express');
const WebSocket = require('ws');

// Express 애플리케이션 생성
const app = express();
const server = app.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행 중입니다.');
});

// WebSocket 서버 생성
const wss = new WebSocket.Server({ server });

// WebSocket 연결 시 실행되는 함수
wss.on('connection', (ws) => {
  console.log('클라이언트가 연결되었습니다.');

  // 메시지를 받았을 때 실행될 함수
  ws.on('message', (message) => {
    console.log('받은 메시지:', message);

    // 받은 메시지를 모든 클라이언트에게 전달 (브로드캐스트)
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // 클라이언트 연결 종료 시
  ws.on('close', () => {
    console.log('클라이언트가 연결을 종료했습니다.');
  });
});

// 정적 파일 제공 (HTML, CSS, JS 등)
app.use(express.static('public'));
