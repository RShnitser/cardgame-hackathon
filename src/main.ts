import { Suit, Rank } from "./game_constants";

type Card = {
  suit: Suit;
  rank: Rank;
};

function createDeck() {
  const result: Card[] = [];

  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      const card: Card = { suit, rank };
      result.push(card);
    }
  }

  for (let i = result.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

//global variables
const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
let prevTime = 0;
const state: GameState = {
  deck: [],
  playerOneHand: [],
};

type Button = {
  isDown: boolean;
  isChanged: boolean;
};

type Input = {
  mouseX: number;
  mouseY: number;
  action: Button;
};

const input: Input = {
  mouseX: 0,
  mouseY: 0,
  action: {
    isDown: false,
    isChanged: false,
  },
};

type GameState = {
  deck: Card[];
  playerOneHand: Card[];
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

function isButtonDown(button: Button) {
  const result = button.isDown;
  return result;
}

function isButtonPressed(button: Button) {
  const result = button.isDown && button.isChanged;
  return result;
}

function isButtonReleased(button: Button) {
  const result = !button.isDown && button.isChanged;
  return result;
}

function drawCards(hand: Card[], deck: Card[], amount: number) {
  amount = Math.min(amount, deck.length);
  for (let i = 0; i < amount; i++) {
    const card = deck.pop();
    if (card !== undefined) {
      hand.push(card);
    }
  }
}

function main() {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);

  state.deck = createDeck();
  drawCards(state.playerOneHand, state.deck, 6);

  window.requestAnimationFrame(update);
}

function update() {
  const now = performance.now();
  const deltaTime = (now - prevTime) * 0.001;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = "blue";

  if (isButtonDown(input.action)) {
    ctx.fillStyle = "yellow";
  }
  ctx.fillRect(input.mouseX, input.mouseY, 10, 10);

  ctx.fillStyle = "white";
  for (let i = 0; i < state.playerOneHand.length; i++) {
    ctx.fillRect(i * 100, 50, 50, 100);
  }
  //ctx.ellipse(input.mouseX, input.mouseY, 5, 5, 0, 0, 2 * Math.PI);
  prevTime = now;
  window.requestAnimationFrame(update);
}

main();
