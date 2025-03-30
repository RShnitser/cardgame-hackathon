import {
  Suit,
  Rank,
  CARD_WIDTH,
  CARD_HEIGHT,
  SCREEN_WIDTH,
  Phase,
} from "./game_constants";

type Card = {
  x: number;
  y: number;
  hovered: boolean;
  selected: boolean;
  suit: Suit;
  rank: Rank;
};

const suitMap = new Map<Suit, string>([
  [Suit.CLUBS, "♣"],
  [Suit.HEARTS, "♥"],
  [Suit.DIAMONDS, "♦"],
  [Suit.SPADES, "♠"],
]);

const rankMap = new Map<Rank, string>([
  [Rank.RANK_6, "6"],
  [Rank.RANK_7, "7"],
  [Rank.RANK_8, "8"],
  [Rank.RANK_9, "9"],
  [Rank.RANK_10, "10"],
  [Rank.RANK_J, "J"],
  [Rank.RANK_Q, "Q"],
  [Rank.RANK_K, "K"],
  [Rank.RANK_A, "A"],
]);

function createDeck() {
  const result: Card[] = [];

  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      const card: Card = {
        x: 0,
        y: 0,
        hovered: false,
        selected: false,
        suit,
        rank,
      };
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
//let prevTime = 0;
const state: GameState = {
  deck: [],
  phase: Phase.PHASE_ATTACK,
  trump: Suit.CLUBS,
  playerOneHand: [],
  playerTwoHand: [],
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
  phase: Phase;
  trump: Suit;
  playerOneHand: Card[];
  playerTwoHand: Card[];
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

// function isButtonPressed(button: Button) {
//   const result = button.isDown && button.isChanged;
//   return result;
// }

// function isButtonReleased(button: Button) {
//   const result = !button.isDown && button.isChanged;
//   return result;
// }

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

  ctx.font = "28px sans-serif";

  state.deck = createDeck();
  state.trump = state.deck[0].suit;
  drawCards(state.playerOneHand, state.deck, 6);

  window.requestAnimationFrame(update);
}

function isPointInRect(
  pointX: number,
  pointY: number,
  rectX: number,
  rectY: number,
  rectW: number,
  rectH: number
) {
  if (
    pointX > rectX &&
    pointX < rectX + rectW &&
    pointY > rectY &&
    pointY < rectY + rectH
  ) {
    return true;
  }
  return false;
}

function renderCard(card: Card) {
  if (card.hovered) {
    ctx.fillStyle = "yellow";
  } else {
    ctx.fillStyle = "white";
  }
  ctx.fillRect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
  if (card.suit === Suit.CLUBS || card.suit === Suit.SPADES) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "red";
  }
  const suitString = suitMap.get(card.suit) as string;
  const rankString = rankMap.get(card.rank) as string;
  ctx.fillText(suitString, card.x + 5, card.y + 20);
  ctx.fillText(rankString, card.x + 15, card.y + 45);
  ctx.strokeStyle = "black";
  ctx.strokeRect(card.x, card.y, CARD_WIDTH, CARD_HEIGHT);
}

function renderDeck(deck: Card[]) {
  const trump = deck[0];
  ctx.fillStyle = "white";
  const trumpX = 600;
  const trumpY = 300;
  ctx.fillRect(600, 300, CARD_HEIGHT, CARD_WIDTH);
  if (trump.suit === Suit.CLUBS || trump.suit === Suit.SPADES) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "red";
  }
  const suitString = suitMap.get(trump.suit) as string;
  const rankString = rankMap.get(trump.rank) as string;
  ctx.fillText(suitString, trumpX + 5, trumpY + 20);
  ctx.fillText(rankString, trumpX + 5, trumpY + 45);

  ctx.fillStyle = "blue";
  const deckX = 630;
  const deckY = 290;
  ctx.fillRect(deckX, deckY, CARD_WIDTH, CARD_HEIGHT);
  ctx.strokeStyle = "black";
  ctx.strokeRect(deckX, deckY, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = "white";
  ctx.fillText(`${deck.length}`, deckX + 10, deckY + 45);
}

function update() {
  //const now = performance.now();
  //const deltaTime = (now - prevTime) * 0.001;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "grey";
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = "blue";

  if (isButtonDown(input.action)) {
    ctx.fillStyle = "yellow";
  }
  ctx.fillRect(input.mouseX, input.mouseY, 10, 10);

  const handSize = state.playerOneHand.length;
  const y = 500;
  const spaceBetweenCards = 5;
  const totalWidth = handSize * CARD_WIDTH + spaceBetweenCards * (handSize - 1);
  const startX = (SCREEN_WIDTH - totalWidth) * 0.5;

  for (let i = 0; i < handSize; i++) {
    const card = state.playerOneHand[i];
    card.x = startX + i * (CARD_WIDTH + spaceBetweenCards);
    card.y = y;
    if (
      isPointInRect(
        input.mouseX,
        input.mouseY,
        card.x,
        card.y,
        CARD_WIDTH,
        CARD_HEIGHT
      )
    ) {
      card.hovered = true;
    } else {
      card.hovered = false;
    }
    renderCard(card);
  }

  renderDeck(state.deck);
  // for (const card of state.playerOneHand) {
  //   renderCard(card);
  // }
  //ctx.ellipse(input.mouseX, input.mouseY, 5, 5, 0, 0, 2 * Math.PI);
  //prevTime = now;
  window.requestAnimationFrame(update);
}

main();
