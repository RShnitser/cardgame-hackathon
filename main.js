//game constants
const SUIT_HEARTS = 1;
const SUIT_DIAMONDS = 2;
const SUIT_SPADES = 3;
const SUIT_CLUBS = 4;

const RANK_6 = 1;
const RANK_7 = 2;
const RANK_8 = 3;
const RANK_9 = 4;
const RANK_10 = 5;
const RANK_J = 6;
const RANK_Q = 7;
const RANK_K = 9;
const RANK_A = 10;

//size in pixels
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

function Card(suit, rank) {
  this.suit = suit;
  this.rank = rank;
}

function createDeck() {
  const result = [];
  const suits = [SUIT_HEARTS, SUIT_DIAMONDS, SUIT_SPADES, SUIT_CLUBS];
  const ranks = [
    RANK_6,
    RANK_7,
    RANK_8,
    RANK_9,
    RANK_10,
    RANK_J,
    RANK_Q,
    RANK_K,
    RANK_A,
  ];
  for (const suit of suits) {
    for (const rank of ranks) {
      result.push(new Card(suit, rank));
    }
  }

  for (let i = result.length - 1; i > 1; i--) {
    const j = Math.floor(Math.random() * i);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

//global variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let prevTime = 0;

const input = {
  mouseX: 0,
  mouseY: 0,
  action: {
    isDown: false,
    isChanged: false,
  },
};

function processInputState(button, isDown) {
  if (button.isDown !== isDown) {
    button.isDown = isDown;
    button.changed = true;
  }
}

function processMouse(button, isDown) {
  //left mouse click
  if (button === 0) {
    processInputState(input.action, isDown);
  }
}

function handleMouseUp(e) {
  const button = e.button;
  processMouse(button, false);
}

function handleMouseDown(e) {
  const button = e.button;
  processMouse(button, true);
}

function handleMouseMove(e) {
  if (canvas !== null) {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = e.clientX - rect.left;
    //input.mouseY = SCREEN_HEIGHT - (e.clientY - rect.top);
    input.mouseY = e.clientY - rect.top;
  }
}

function isButtonDown(button) {
  const result = button.isDown;
  return result;
}

function isButtonPressed(button) {
  const result = button.isDown && button.changed;
  return result;
}

function isButtonReleased(button) {
  const result = !button.isDown && button.isChanged;
  return result;
}

function main() {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);
  const deck = createDeck();

  window.requestAnimationFrame(update);
}

function update() {
  const now = performance.now();
  const deltaTime = (now - prevTime) * 0.001;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "blue";

  if (isButtonDown(input.action)) {
    ctx.fillStyle = "yellow";
  }
  ctx.fillRect(input.mouseX, input.mouseY, 10, 10);
  //ctx.ellipse(input.mouseX, input.mouseY, 5, 5, 0, 0, 2 * Math.PI);
  prevTime = now;
  window.requestAnimationFrame(update);
}

main();
