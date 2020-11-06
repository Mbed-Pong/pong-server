function findAvailableLobby(lobbies) {
  lobbies.forEach((lobby, key) => {
    let playersInLobby = lobby.numPlayers;
    if (playersInLobby === 1) {
      return key;
    } else if (playersInLobby === 0) {
      lobbies.delete(key);
    }
  });
  return null;
}

module.exports.findAvailableLobby = findAvailableLobby;