import { GameState } from "./game";

export type Lobby = {
  numPlayers: 0 | 1 | 2;
  gameState: GameState;
  net: {addr: string, port: number}[];
  ticker?: NodeJS.Timeout;
}

export const findAvailableLobby = (lobbies: Map<string, Lobby>):null | string => {
  let foundKey = null;
  lobbies.forEach((lobby, key) => {
    let playersInLobby = lobby.numPlayers;
    if (playersInLobby === 1) {
      foundKey = key;
    } else if (playersInLobby === 0) {
      lobbies.delete(key);
    }
  });
  return foundKey;
}