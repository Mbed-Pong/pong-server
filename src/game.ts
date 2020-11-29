import * as App from './app'

/**
 * Options type for initializing a `GameState`
 */
type GameStateOptions = {
  /**
   * height of the gameboard
   */
  height: number;

  /**
   * width of the gameboard
   */
  width: number;

  /**
   * points required for game over
   * (default 5)
   */
  pointsToWin?: number;

  /**
   * ball speed 
   * (default .8)
   */
  ballSpeed?: number;

  /**
   * have the ball speed up each time it hits a wall 
   * (default .2)
   */
  wallAccel?: number;

  /**
   * size of the paddles (in pixels) should be odd
   * (default 31)
   */
  paddleSize?: number;

  /**
   * how far the paddles are from the goals (in pixels)
   * (default 5)
   */
  paddleElevation?: number;

  /**
   * countdown before game begins (in milis) should be divisible by TICK_TIME
   * (default 3240)
   */
  countdown?: number;
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
  #wallAccel: number;
  #paddleReach: number;
  #paddleElevation: number;
  #wallBounces: number;
  // public
  ballPos: [number, number];
  score: [number, number];
  playerOnePos: number;
  playerTwoPos: number;
  isOver: number;
  countdown: number;
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
    this.#ballSpeed = options.ballSpeed || .8;
    this.#ballDir = [0, 1];
    this.#ballPosActual = [options.width / 2 - 1, options.height / 2 - 1];
    this.#wallAccel = options.wallAccel || .2;
    this.#paddleReach = options.paddleSize ? Math.floor(options.paddleSize / 2) : 15;
    this.#paddleElevation = options.paddleElevation || 5;
    this.#wallBounces = 0;

    this.playerOnePos = options.height / 2 - 1;
    this.playerTwoPos = options.height / 2 - 1;
    this.ballPos = [options.width / 2 - 1, options.height / 2 - 1];
    this.score = [0, 0];
    this.isOver = 0;
    this.countdown = options.countdown || 3240;

    this.onEnd = () => { };
    this.onTickForward = () => { };
  };

  /**
   * set both values of ballPos in one funciton
   * @param position position to set
   */
  private set ballPosActual(position: [number, number]) {
    this.#ballPosActual = position;
    this.ballPos = [Math.round(position[0]), Math.round(position[1])];
  }

  /**
   * reset the ball back to the middile and randomize the initial direction
   */
  private resetBall() {
    this.ballPosActual = [this.#x / 2 - 1, this.#y / 2 - 1];
    this.randomizeDir(60, 0, true);
    this.#wallBounces = 0;
  }

  /**
   * function to handle direction randomization for bounces and initial ball states
   * @param max maximum angle (in deg)
   * @param min minimum angle (in deg)
   * @param flipY if true will also randomly flip the angle along the y axis
   */
  private randomizeDir(max: number, min: number, flipY?: boolean) {
    let currAngle = Math.atan2(this.#ballDir[1], this.#ballDir[0]) * 180 / Math.PI;
    let randAug = (Math.floor(Math.random() * (max - min + 1)) + min) * (Math.round(Math.random()) * 2 - 1);
    let randAngle = (currAngle + randAug) * Math.PI / 180;
    if (!flipY) {
      this.#ballDir = [
        Math.cos(randAngle),
        Math.sin(randAngle)
      ];
    } else {
      this.#ballDir = [
        Math.cos(randAngle),
        (Math.round(Math.random()) * 2 - 1) * Math.sin(randAngle)
      ];
    }
  }

  /**
   * handles ball bouncing/reflecting off of an axis (does *not* randomize)
   * @param axis axis of surface to bounce off of
   */
  private bounceDir(axis: 'horiz' | 'vert') {
    if (axis === 'horiz') {
      this.#ballDir = [this.#ballDir[0], -1 * this.#ballDir[1]];
    } else {
      this.#ballDir = [-1 * this.#ballDir[0], this.#ballDir[1]];
    }
  }

  /**
   * updates player positions
   * @param player player to update
   * @param move amount to move `player` by
   */
  update(player: 0 | 1, move: number) {
    // respond to player move
    // probably want to change these to reflect the size of the paddles
    // console.log(`player ${player} attempted a move of ${move}`);
    if (player === 0) {
      if (this.playerOnePos + move - this.#paddleReach >= 0 && this.playerOnePos + move + this.#paddleReach <= this.#x - 1) {
        this.playerOnePos += move;
      }
    }
    if (player === 1) {
      if (this.playerTwoPos + move - this.#paddleReach >= 0 && this.playerTwoPos + move + this.#paddleReach <= this.#x - 1) {
        this.playerTwoPos += move;
      }
    }
  }

  /**
   * ticks the game forward
   */
  tickForward() {
    if (this.countdown > 0) {
      this.countdown -= App.TICK_TIME;
    } else {
      // check for wall bounce
      if (this.#ballPosActual[0] <= 0 || this.#ballPosActual[0] >= this.#x - 1) {
        this.bounceDir('vert');
        this.#wallBounces++;
      }

      // check for paddle bounce
      // player 1
      if (this.#ballPosActual[1] > this.#paddleElevation &&
        this.#ballPosActual[1] < this.#paddleElevation + 2) {
        if (this.#ballPosActual[0] >= this.playerOnePos - this.#paddleReach &&
          this.#ballPosActual[0] <= this.playerOnePos + this.#paddleReach) {
          this.bounceDir('horiz');
          this.randomizeDir(20, 10);
          this.#wallBounces = 0;
        }
      }

      // player 2
      if (this.#ballPosActual[1] < this.#y - 1 - this.#paddleElevation &&
        this.#ballPosActual[1] > this.#y - 1 - this.#paddleElevation - 2) {
        if (this.#ballPosActual[0] >= this.playerTwoPos - this.#paddleReach &&
          this.#ballPosActual[0] <= this.playerTwoPos + this.#paddleReach) {
          this.bounceDir('horiz');
          this.randomizeDir(20, 10);
          this.#wallBounces = 0;
        }
      }

      // move the ball
      this.ballPosActual = [
        this.#ballPosActual[0] + this.#ballDir[0] * (this.#ballSpeed + this.#wallBounces * this.#wallAccel),
        this.#ballPosActual[1] + this.#ballDir[1] * (this.#ballSpeed + this.#wallBounces * this.#wallAccel)
      ];

      // player 2 scores
      if (this.#ballPosActual[1] <= 0) {
        this.score[1]++;
        this.resetBall();
      }

      // player 1 scores
      if (this.#ballPosActual[1] >= this.#y - 1) {
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
    }
    // call onTickForward every tick
    this.onTickForward();
    // log gamestate to console
    console.log(JSON.stringify(this));
  };

};
