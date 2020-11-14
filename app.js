require('dotenv').config();
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const port = process.env.PORT;
const { GameState } = require('./game.js');
const { findAvailableLobby } = require('./matchMaking.js');

const MAX_LOBBIES = 5;
const TICK_TIME = 20;

let lobbies = new Map();

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
});

server.on('connect', () => {
  console.log('something connected');
});

server.on('close', () => {
});

server.on('message', (msg, rinfo) => {
  console.log(msg.toString());
  try {
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
            lobbies.set(hash, { net: [{ addr: rinfo.address, port: rinfo.port }], gameState: new GameState(128, 128, 5) });
            server.send(JSON.stringify({ type: 'connected', player: 0, hash: hash }), rinfo.port, rinfo.address);
          }
        } else {
          let lobby = lobbies.get(found);
          lobby.numPlayers++;
          lobby.net[1] = { addr: rinfo.address, port: rinfo.port };
          // send hash to players when ready
          server.send(JSON.stringify({ type: 'connected', player: 1, hash: found }), rinfo.port, rinfo.address);
          if (lobby.numPlayers === 2) {
            // start game and send gamestate to both players
            // need to come up with a way to clear the interval
            lobby.gameState.onTickForward = () => {
              lobby.net.map((netinfo) => {
                server.send(JSON.stringify(lobby.gameState), netinfo.port, netinfo.addr);
              })
            }
            lobby.ticker = setInterval(() => { lobby.gameState.tickForward }, TICK_TIME);
            lobby.gameState.onEnd = () => { clearInterval(lobby.ticker) };
          }
        }
        break;
      case 'move':
        let lobby = lobbies.get(json.hash);
        lobby.gameState.update(json.player, json.delta);
        break;
    }
  } catch (e) {
    console.log(e);
  }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`UDP Socket running on: ${address.address}:${port}`);
})

server.bind(port);
