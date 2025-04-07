import { gameUpdate, gameInitialize, resetGame } from "./game";
import { Suit, Phase } from "./game_constants";
import { GameState, Input, Button } from "./game_types";
import { renderClear } from "./renderer";
import { UIEnd, UIStart } from "./ui";

//global variables
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const gameOverModal = document.getElementById("gameover") as HTMLElement;
const gameOverButton = document.getElementById("gameoverbutton") as HTMLElement;

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

gameOverButton.addEventListener("click", gameOverOnClick);

function gameOverOnClick() {
  gameOverModal.style.display = "none";
  resetGame(state);
}

export function displayGameOver() {
  gameOverModal.style.display = "block";
}

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
    input.mouseY = e.clientY - rect.top;
  }
}

function main() {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);

  ctx.font = "28px sans-serif";

  gameInitialize(state);

  window.requestAnimationFrame(update);
}

function update() {
  renderClear(ctx, canvas.width, canvas.height, "grey");
  UIStart(state);
  if (!state.gameOver) {
    gameUpdate(ctx, state, input);
  }
  UIEnd(state, input);

  window.requestAnimationFrame(update);
}

main();
