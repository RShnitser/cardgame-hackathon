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

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let prevTime = 0;

function main() {
  const deck = createDeck();
  window.requestAnimationFrame(update);
}

function update() {
  const now = performance.now();
  const deltaTime = (now - prevTime) * 0.001;

  ctx.clearRect(0, 0, 800, 600);
  prevTime = now;
  window.requestAnimationFrame(update);
}

main();
