import { gameUpdate, gameInitialize } from "./game";
import { Suit, Phase } from "./game_constants";
import { GameState, Input, Button } from "./game_types";

//global variables
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
//let prevTime = 0;
const state: GameState = {
  deck: [],
  phase: Phase.PHASE_P1_ATTACK,
  trump: Suit.CLUBS,
  playerOneHand: [],
  playerTwoHand: [],
  currentAttack: null,
  bout: [],
  selectedCards: [],
  log: [],

  hoveredCard: null,
  selectedCard: null,
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
  // if (state.phase === Phase.PHASE_ATTACK) {
  //   log(state, "Attacking");
  // } else {
  //   log(state, "Defending");
  // }

  window.requestAnimationFrame(update);
}

function update() {
  //const now = performance.now();
  //const deltaTime = (now - prevTime) * 0.001;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, 800, 600);
  // ctx.fillStyle = "blue";

  gameUpdate(ctx, state, input);
  // if (isButtonDown(input.action)) {
  //   ctx.fillStyle = "yellow";
  // }
  // ctx.fillRect(input.mouseX, input.mouseY, 10, 10);

  // const spaceBetweenCards = 5;

  // const handSizeP1 = state.playerOneHand.length;
  // const yP1 = 500;
  // const totalWidthP1 =
  //   handSizeP1 * CARD_WIDTH + spaceBetweenCards * (handSizeP1 - 1);
  // const startXP1 = (SCREEN_WIDTH - totalWidthP1) * 0.5;

  // for (let i = 0; i < handSizeP1; i++) {
  //   const card = state.playerOneHand[i];
  //   card.x = startXP1 + i * (CARD_WIDTH + spaceBetweenCards);
  //   card.y = yP1;
  //   if (
  //     isPointInRect(
  //       input.mouseX,
  //       input.mouseY,
  //       card.x,
  //       card.y,
  //       CARD_WIDTH,
  //       CARD_HEIGHT
  //     )
  //   ) {
  //     card.hovered = true;
  //     if (isButtonDown(input.action)) {
  //       performCardAction(state, card);
  //     }
  //   } else {
  //     card.hovered = false;
  //   }
  //   renderCard(ctx, card);
  // }

  // const handSizeP2 = state.playerOneHand.length;
  // const yP2 = 30;
  // const totalWidthP2 =
  //   handSizeP2 * CARD_WIDTH + spaceBetweenCards * (handSizeP2 - 1);
  // const startXP2 = (SCREEN_WIDTH - totalWidthP2) * 0.5;

  // for (let i = 0; i < handSizeP2; i++) {
  //   const card = state.playerTwoHand[i];
  //   card.x = startXP2 + i * (CARD_WIDTH + spaceBetweenCards);
  //   card.y = yP2;
  //   renderCard(ctx, card);
  // }

  // renderDeck(ctx, state.deck);

  //prevTime = now;
  window.requestAnimationFrame(update);
}

main();
