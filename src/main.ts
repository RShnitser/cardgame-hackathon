import {
  Suit,
  Rank,
  CARD_WIDTH,
  CARD_HEIGHT,
  SCREEN_WIDTH,
  Phase,
  SCREEN_HEIGHT,
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

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
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
  log: [],
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
  log: string[];
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

function shouldReshuffleDeck(hand: Card[]) {
  const suitCount = new Map<Suit, number>([
    [Suit.CLUBS, 0],
    [Suit.DIAMONDS, 0],
    [Suit.HEARTS, 0],
    [Suit.SPADES, 0],
  ]);

  for (const card of hand) {
    const count = suitCount.get(card.suit) as number;
    suitCount.set(card.suit, count + 1);
  }

  for (const count of suitCount.values()) {
    if (count >= 5) {
      return true;
    }
  }

  if (
    (suitCount.get(Suit.CLUBS) as number) +
      (suitCount.get(Suit.SPADES) as number) ===
    6
  ) {
    return true;
  }

  if (
    (suitCount.get(Suit.HEARTS) as number) +
      (suitCount.get(Suit.DIAMONDS) as number) ===
    6
  ) {
    return true;
  }

  return false;
}

function dealCards(state: GameState) {
  while (true) {
    state.deck = createDeck();
    state.playerOneHand = [];
    state.playerTwoHand = [];
    state.trump = state.deck[0].suit;
    drawCards(state.playerOneHand, state.deck, 6);
    drawCards(state.playerTwoHand, state.deck, 6);

    let lowestTrumpOne: Rank | null = null;
    let lowestTrumpTwo: Rank | null = null;

    for (const card of state.playerOneHand) {
      if (card.suit === state.trump) {
        if (lowestTrumpOne === null || card.rank < lowestTrumpOne) {
          lowestTrumpOne = card.rank;
        }
      }
    }

    for (const card of state.playerTwoHand) {
      if (card.suit === state.trump) {
        if (lowestTrumpTwo === null || card.rank < lowestTrumpTwo) {
          lowestTrumpTwo = card.rank;
        }
      }
    }

    if (lowestTrumpOne === null && lowestTrumpTwo !== null) {
      state.phase = Phase.PHASE_DEFEND;
    }

    if (lowestTrumpOne !== null && lowestTrumpTwo !== null) {
      if (lowestTrumpTwo < lowestTrumpOne) {
        state.phase = Phase.PHASE_DEFEND;
      }
    }

    if (
      !shouldReshuffleDeck(state.playerOneHand) &&
      !shouldReshuffleDeck(state.playerTwoHand)
    ) {
      break;
    }
  }
}

function log(state: GameState, message: string) {
  state.log.push(message);
}

function main() {
  window.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mouseup", handleMouseUp);
  window.addEventListener("mousemove", handleMouseMove);

  ctx.font = "28px sans-serif";

  dealCards(state);
  if (state.phase === Phase.PHASE_ATTACK) {
    log(state, "Attacking");
  } else {
    log(state, "Defending");
  }

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
  const trumpY = SCREEN_HEIGHT * 0.5 - CARD_WIDTH * 0.5;
  ctx.fillRect(trumpX, trumpY, CARD_HEIGHT, CARD_WIDTH);
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
  const deckY = SCREEN_HEIGHT * 0.5 - CARD_HEIGHT * 0.5;
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

  const spaceBetweenCards = 5;

  const handSizeP1 = state.playerOneHand.length;
  const yP1 = 500;
  const totalWidthP1 =
    handSizeP1 * CARD_WIDTH + spaceBetweenCards * (handSizeP1 - 1);
  const startXP1 = (SCREEN_WIDTH - totalWidthP1) * 0.5;

  for (let i = 0; i < handSizeP1; i++) {
    const card = state.playerOneHand[i];
    card.x = startXP1 + i * (CARD_WIDTH + spaceBetweenCards);
    card.y = yP1;
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

  const handSizeP2 = state.playerOneHand.length;
  const yP2 = 30;
  const totalWidthP2 =
    handSizeP2 * CARD_WIDTH + spaceBetweenCards * (handSizeP2 - 1);
  const startXP2 = (SCREEN_WIDTH - totalWidthP2) * 0.5;

  for (let i = 0; i < handSizeP2; i++) {
    const card = state.playerTwoHand[i];
    card.x = startXP2 + i * (CARD_WIDTH + spaceBetweenCards);
    card.y = yP2;
    renderCard(card);
  }

  renderDeck(state.deck);

  //prevTime = now;
  window.requestAnimationFrame(update);
}

main();
