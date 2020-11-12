// help me god

const clampNumber = (num, min, max) => (Math.max(Math.min(num, max), min));

/**
 * creates a game state that can be broadcast to connected devices. 
 * @param {*} x horizontal dimension of the board 
 * @param {*} y vertical dimension of the board 
 * @param {*} pointsToWin points to win game
 */

class GameState {
  #ballSpeed = .2;
  #x;
  #y;
  #pointsToWin;

  constructor(x, y, pointsToWin) {
    this.#x = x;
    this.#y = y;
    this.#pointsToWin = pointsToWin || 5;
    this.playerOnePos = y / 2 - 1; // y / 2 - 1
    this.playerTwoPos = x / 2 - 1;
    this.ballDir = [1, 0];
    this.ballPos = [x / 2 - 1, y / 2 - 1];
    this.score = [0, 0];
    this.isOver = 0; // 1 for player 1 victory 2 for player 2 victory 3 for other/disconnect
  };

  #resetBall() {
    this.ballPos = [this.#x / 2 - 1, this.#y / 2 - 1]
  }

  // get isOver() {
  //   return this.score[0] >= 3 || this.score[1] >= 3;
  // }

  /**
   * 
   */ 
  update(player, move) {
    // respond to player move
    // probably want to change these to reflect the size of the paddles
    if (player === 0) {
      this.playerOnePos = clampNumber(this.playerOnePos + move, 0, this.#y - 1);
    }
    if (player === 1) {
      this.playerTwoPos = clampNumber(this.playerTwoPos + move, 0, this.#y - 1);
    }
  }

  tickForward () {
    // console.log("hello world")
    // move the ball
    this.ballPos = this.ballDir.map((component, index) => {
      this.ballPos[index] + component * this.#ballSpeed;
    })
    // player 2 scores
    if (ballPos[0] <= 0) {
      this.score[1]++;
      this.#resetBall();
    }
    // player 1 scores
    if (ballPos[0] >= this.#x - 1) {
      this.score[0]++;
      this.#resetBall();
    }
    // check for winner
    if (Math.max(this.score) >= this.#pointsToWin) {
      this.isOver = this.score.indexOf(Math.max(this.score)) + 1;
    }
    console.log(JSON.stringify(this));
  };

};

// export default { GameState }

module.exports.GameState = GameState; 
// JSON.stringify(gameState)


