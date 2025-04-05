import { gameUpdate, gameInitialize } from "./game";
import { Suit, Phase } from "./game_constants";
import { GameState, Input, Button } from "./game_types";
import { renderClear } from "./renderer";
import { UIEnd, UIStart } from "./ui";

//global variables
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//let prevTime = 0;
const state: GameState = {
  gameOver: false,
  deck: [],
  phase: Phase.PHASE_P1_ATTACK,
  trump: Suit.CLUBS,
  playerOneHand: [],
  playerTwoHand: [],
  currentAttack: null,
  bout: [],
  selectedCards: new Set(),
  //log: [],
  events: [],

  idCounter: 0,
  hotItem: 0,
  activeItem: 0,
};

const input: Input = {
  mouseX: 0,
  mouseY: 0,
  action: {
    isDown: false,
    isChanged: false,
  },
};

function processInputState(button: Button, isDown: boolean) {
  if (button.isDown !== isDown) {
    button.isDown = isDown;
    button.isChanged = true;
  }
}

function processMouse(button: number, isDown: boolean) {
  //left mouse click
  if (button === 0) {
    processInputState(input.action, isDown);
  }
}

function handleMouseUp(e: MouseEvent) {
  const button = e.button;
  processMouse(button, false);
}

function handleMouseDown(e: MouseEvent) {
  const button = e.button;
  processMouse(button, true);
}

function handleMouseMove(e: MouseEvent) {
  if (canvas !== null) {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = e.clientX - rect.left;
    //input.mouseY = SCREEN_HEIGHT - (e.clientY - rect.top);
    input.mouseY = e.clientY - rect.top;
  }
}

// function log(state: GameState, message: string) {
//   state.log.push(message);
// }

function main() {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);

  ctx.font = "28px sans-serif";

  gameInitialize(state);

  window.requestAnimationFrame(update);
}

function update() {
  //const now = performance.now();
  //const deltaTime = (now - prevTime) * 0.001;

  renderClear(ctx, canvas.width, canvas.height, "grey");
  UIStart(state);
  gameUpdate(ctx, state, input);
  UIEnd(state, input);

  //prevTime = now;
  window.requestAnimationFrame(update);
}

main();
