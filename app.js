require('dotenv').config();
const http = require('http');
const WebSocket = require('ws');
const hostname = '127.0.0.1';
const port = process.env.PORT;

const server = http.createServer((req, res) => {});

const wss = new WebSocket.Server({ server: server })
// const ws = new WebSocket(`ws://${hostname}:${port}/`);

wss.on('connection', (ws) => {
  console.log('connection made')
  ws.on('message', (msg) => {
    console.log(msg);
  });

  ws.send('something');
})

server.listen(port, hostname, () => {
  console.log(`http server running on: http://${hostname}:${port}/`);
  console.log(wss.address());
});