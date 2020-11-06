require('dotenv').config();
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const hostname = '127.0.0.1';
const port = process.env.PORT;
const { GameState } = require('./game.js');
const { findAvailableLobby } = require('./matchMaking.js');

var MAX_LOBBIES = 5;
let lobbies = new Map();

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`)
});

server.on('connect', () => {
  // numPlayers += 1;
  // matchmaking logic
});

server.on('close', () => {
  numPlayers -= 1;
});

server.on('message', (msg, rinfo) => {
  console.log(msg);
  const json = JSON.parse(msg);

  switch (json.type) {
    case 'connected':
      let found = findAvailableLobby(lobbies);
      if (found === null) {
        if (lobbies.size >= MAX_LOBBIES) {
          // respond that lobbies are full
        } else {
          // create new lobby and hash
          let hash = "jaredyaegersflipflop";
          lobbies.set(hash, { net: [{ addr: rinfo.address, port: rinfo.port }], gameState: new GameState(128, 128) });
          server.send('eyyyyyy bal', rinfo.port, rinfo.address);
        }
      } else {
        let lobby = lobbies[found];
        lobby.numPlayers++;
        lobby.net[1] = { addr: rinfo.address, port: rinfo.port };
        // send hash to players when ready
        if (lobby.numPlayers === 2) {
          // start game and send gamestate to both players 

        }
      }
      break;
    case 'move':
      break;
  }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`UDP Socket running on: ${address.address}:${port}/`);
})

// TODO: rename TICK_TIME to PIZZA_TIME
// const handler = setInterval(() => { }, TICK_TIME)
// clearInterval(handler)

server.bind(port, hostname);
