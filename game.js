// help me god

const clampNumber = (num, min, max) => (Math.max(Math.min(num, max), min));

/**
 * Game state class that handles the game state
 */
class GameState {
  #ballSpeed = .2;
  #ballDir;
  #x;
  #y;
  #pointsToWin;

  /**
   * creates a game state that can be broadcast to connected devices. 
   * @param {number} x horizontal dimension of the board 
   * @param {number} y vertical dimension of the board 
   * @param {number} pointsToWin points to win game
   */
  constructor(x, y, pointsToWin) {
    this.#x = x;
    this.#y = y;
    this.#pointsToWin = pointsToWin || 5;
    this.playerOnePos = y / 2 - 1; // y / 2 - 1
    this.playerTwoPos = x / 2 - 1;
    // randomnize
    this.#ballDir = [1, 0];
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
   * called when game ends
   * @param {() => void} onEnd
   */
  set onEnd(onEnd) {
    this.onEnd = onEnd;
  }

  /**
   * called at the end of a tick cycle
   * @param {() => void} onTickForward
   */
  set onTickForward(onTickForward) {
    this.onTickForward = onTickForward;
  }

  #end() {
    this.onEnd();
  }

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

  tickForward() {
    // console.log("hello world")
    // move the ball
    this.ballPos = this.#ballDir.map((component, index) => {
      this.ballPos[index] + component * this.#ballSpeed;
    })
    // check for paddle hit
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
    // check for game over
    if (isOver) {
      this.#end();
    }
    this.onTickForward();
    console.log(JSON.stringify(this));
  };

};

// export default { GameState }

module.exports.GameState = GameState;
// JSON.stringify(gameState)


