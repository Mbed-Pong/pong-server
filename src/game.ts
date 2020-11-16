const clampNumber = (num: number, min: number, max: number) => (Math.max(Math.min(num, max), min));

// enum State {
//   HORIZONTAL=0,
//   VERTICAL=1,
// }

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
  #ballPosActual: [number, number];
  #x: number;
  #y: number;
  #pointsToWin: number;
  // public
  ballPos: [number, number];
  score: [number, number];
  playerOnePos: number;
  playerTwoPos: number;
  isOver: number;
  // callbacks
  /**
   * called when game ends
   */
  onEnd: () => void;
  /**
   * called at the end of a game tick
   */
  onTickForward: () => void;

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
    this.#ballPosActual = [options.width / 2 - 1, options.height / 2 - 1];
    this.ballPos = [options.width / 2 - 1, options.height / 2 - 1];
    this.score = [0, 0];
    this.isOver = 0;
    this.onEnd = () => { };
    this.onTickForward = () => { };
  };

  private set ballPosActual(position: [number, number]) {
    this.#ballPosActual = position;
    this.ballPos = [Math.round(position[0]), Math.round(position[1])]
  }

  private resetBall() {
    this.ballPosActual = [this.#x / 2 - 1, this.#y / 2 - 1];
    this.randomnizeDir(180);
  }

  private randomnizeDir(range: number) {
    let currAngle = Math.atan2(this.#ballDir[1], this.#ballDir[0]) * 180 / Math.PI;
    let randAngle = (Math.floor(Math.random() * (currAngle + 2 * range + 1)) - range) * Math.PI / 180;
    this.#ballDir = [Math.cos(randAngle), Math.sin(randAngle)];
  }

  private bounceDir() {

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

  /**
   * 
   */
  tickForward() {
    // console.log("hello world")
    // move the ball
    this.ballPosActual = [this.#ballPosActual[0] + this.#ballDir[0] * this.#ballSpeed, this.#ballPosActual[1] + this.#ballDir[1] * this.#ballSpeed];
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
    } else {
      this.onTickForward();
    }
    console.log(JSON.stringify(this));
  };

};
