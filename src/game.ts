const clampNumber = (num: number, min: number, max: number) => (Math.max(Math.min(num, max), min));

type GameStateOptions = {
  height: number;
  width: number;
  pointsToWin?: number;
  ballSpeed?: number;
}

/**
 * Game state class that handles the game state
 */
export class GameState {
  // private
  #ballSpeed: number;
  #ballDir: [number, number];
  #x: number;
  #y: number;
  #pointsToWin: number;
  // public
  ballPos: [number, number];
  score: [number, number];
  playerOnePos: number;
  playerTwoPos: number;
  isOver: number;

  /**
   * creates a game state that can be broadcast to connected devices. 
   * @param options see type `GameStateOptions`
   */
  constructor(options: GameStateOptions) {
    this.#x = options.width;
    this.#y = options.height;
    this.#pointsToWin = options.pointsToWin || 5;
    this.playerOnePos = options.height / 2 - 1; // y / 2 - 1
    this.playerTwoPos = options.height / 2 - 1;
    // randomnize
    this.#ballSpeed = options.ballSpeed || .2;
    this.#ballDir = [1, 0];
    this.ballPos = [options.width / 2 - 1, options.height / 2 - 1];
    this.score = [0, 0];
    this.isOver = 0; // 1 for player 1 victory 2 for player 2 victory 3 for other/disconnect
  };

  private resetBall() {
    this.ballPos = [this.#x / 2 - 1, this.#y / 2 - 1]
  }

  // get isOver() {
  //   return this.score[0] >= 3 || this.score[1] >= 3;
  // }

  /**
   * called when game ends
   * @param {() => void} onEnd
   */
  set onEnd(onEnd: () => void) {
    this.onEnd = onEnd;
  }

  /**
   * called at the end of a tick cycle
   * @param {() => void} onTickForward
   */
  set onTickForward(onTickForward: () => void) {
    this.onTickForward = onTickForward;
  }

  /**
   * 
   */
  update(player: 0 | 1, move: number) {
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
    this.ballPos[0] += this.#ballDir[0] * this.#ballSpeed;
    this.ballPos[1] += this.#ballDir[1] * this.#ballSpeed;
    // check for paddle hit
    // player 2 scores
    if (this.ballPos[0] <= 0) {
      this.score[1]++;
      this.resetBall();
    }
    // player 1 scores
    if (this.ballPos[0] >= this.#x - 1) {
      this.score[0]++;
      this.resetBall();
    }
    // check for winner
    if (Math.max(...this.score) >= this.#pointsToWin) {
      this.isOver = this.score.indexOf(Math.max(...this.score)) + 1;
    }
    // check for game over
    if (this.isOver) {
      this.onEnd();
    }
    this.onTickForward();
    console.log(JSON.stringify(this));
  };

};
