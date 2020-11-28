require('dotenv').config();
import dgram from 'dgram';
import { GameState } from './game';
import { findAvailableLobby, Lobby } from './matchMaking';

const server = dgram.createSocket('udp4');
const port = process.env.PORT;

const MAX_LOBBIES = 5;
export const TICK_TIME = 20;

let lobbies: Map<string, Lobby> = new Map();

type Message = {
  type: 'connected';
} | {
  type: 'move';
  hash: string;
  player: 0 | 1;
  delta: number;
} | {
  type: 'disconnect';
  hash: string;
}

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
    const json: Message = JSON.parse(msg.toString());
    let lobby;
    switch (json.type) {
      case 'connected':
        let found = findAvailableLobby(lobbies);
        if (found === null) {
          if (lobbies.size >= MAX_LOBBIES) {
            // respond that lobbies are full
          } else {
            // create new lobby and hash
            let hash = "jaredyeagersflipflop";
            lobbies.set(hash, {
              numPlayers: 1,
              net: [{ addr: rinfo.address, port: rinfo.port }],
              gameState: new GameState({ height: 128, width: 128, pointsToWin: 5 }),
            });
            server.send(JSON.stringify({ type: 'connected', player: 0, hash: hash }), rinfo.port, rinfo.address);
          }
        } else {
          let lobby = lobbies.get(found);
          if (!lobby) {
            console.log('lobby does not exist')
            // lobby doesn't exist
            return;
          }
          lobby.numPlayers++;
          lobby.net[1] = { addr: rinfo.address, port: rinfo.port };
          // send hash to players when ready
          server.send(JSON.stringify({ type: 'connected', player: 1, hash: found }), rinfo.port, rinfo.address);
          if (lobby.numPlayers === 2) {
            // start game and send gamestate to both players
            // need to come up with a way to clear the interval
            console.log('setting onTickForward()...');
            lobby.gameState.onTickForward = () => {
              lobby && lobby.net.map((netinfo, player) => {
                if (lobby === undefined) {
                  console.log('lobby is undefined');
                  return;
                }
                server.send(JSON.stringify({ type: 'gameState', gameState: lobby.gameState }), netinfo.port, netinfo.addr);
                // console.log("Sending game state to player " + player);
              })
            };
            console.log('setting ticker...');
            lobby.ticker = setInterval(() => { lobby && lobby.gameState.tickForward() }, TICK_TIME);
            // console.log('setting onEnd...');
            // lobby.gameState.onEnd = () => {
            //   lobby?.ticker && clearInterval(lobby.ticker);
            //   found && lobbies.delete(found);
            // };
          }
        }
        break;
      case 'move':
        lobby = lobbies.get(json.hash);
        if (lobby === undefined) {
          console.log('lobby not found at hash');
          return;
        }
        lobby.gameState.update(json.player, json.delta);
        // console.log('updated positions');
        break;
      case 'disconnect':
        lobby = lobbies.get(json.hash);
        if (lobby === undefined) {
          console.log('lobby not found at hash')
          return;
        }
        lobby.net.filter((value) => value.addr !== rinfo.address)
        lobby.numPlayers = lobby.net.length;
        if (lobby.numPlayers === 0) {
          console.log('both players have disconnected: stoping ticking... ')
          lobby.ticker && clearInterval(lobby.ticker);
        }
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

port && server.bind(Number(port));
