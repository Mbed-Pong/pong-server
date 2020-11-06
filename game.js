// help me god

/**
 * creates a game state that can be broadcast to connected devices. 
 * @param {*} x horizontal dimension of the board 
 * @param {*} y vertical dimension of the board 
 */

class GameState {
  constructor(x, y) {
    this.playerOnePos = 63; // y / 2 - 1
    this.playerTwoPos = 63;
    this.ballDir = [1.0, 0];
    this.ballPos = [];
    this.score = [0, 0];
  };

  get isOver() {
    return this.score[0] >= 3 || this.score[1] >= 3;
  }

  /**
   * 
   */ 
  update(move) {
    // respond to player move
  }

  tickForward () {
    console.log("hello world")
    // move the ball, score, etc.
  };

};

// export default { GameState }

module.exports.GameState = GameState; 
// JSON.stringify(gameState)


