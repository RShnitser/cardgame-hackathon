import { Card, Button, GameState, Attack, Input } from "./game_types";
import {
  Suit,
  Rank,
  Phase,
  CARD_WIDTH,
  SCREEN_WIDTH,
  CARD_HEIGHT,
} from "./game_constants";
import { renderCard, renderDeck } from "./renderer";
import { UICreateCardButton } from "./ui";

export function isPointInRect(
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

function createDeck() {
  const result: Card[] = [];

  for (const suit of Object.values(Suit)) {
    for (const rank of Object.values(Rank)) {
      const card: Card = {
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
      state.phase = Phase.PHASE_P2_ATTACK;
    }

    if (lowestTrumpOne !== null && lowestTrumpTwo !== null) {
      if (lowestTrumpTwo < lowestTrumpOne) {
        state.phase = Phase.PHASE_P2_ATTACK;
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

function createDefense(state: GameState, card: Card) {
  if (state.currentAttack === null) {
    return;
  }

  if (
    card.suit === state.trump &&
    state.currentAttack.attack.suit !== state.trump
  ) {
    state.currentAttack.defense = card;
    return;
  }

  if (
    card.suit === state.currentAttack.attack.suit &&
    card.rank > state.currentAttack.attack.rank
  ) {
    state.currentAttack.defense = card;
  }
}

function createAttack(state: GameState, card: Card) {
  state.selectedCards.push(card.rank);

  const attack: Attack = {
    attack: card,
    defense: null,
  };
  state.currentAttack = attack;
}

function performCardAction(state: GameState, card: Card) {
  switch (state.phase) {
    case Phase.PHASE_P1_ATTACK:
      if (
        state.selectedCards.length === 0 ||
        !state.selectedCards.includes(card.rank)
      ) {
        createAttack(state, card);
        state.phase = Phase.PHASE_P2_DEFEND;
      }
      break;
  }
}

export function gameInitialize(state: GameState) {
  dealCards(state);
}

export function gameUpdate(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  input: Input
) {
  const spaceBetweenCards = 5;
  const handSizeP1 = state.playerOneHand.length;
  const yP1 = 500;
  const totalWidthP1 =
    handSizeP1 * CARD_WIDTH + spaceBetweenCards * (handSizeP1 - 1);
  const startXP1 = (SCREEN_WIDTH - totalWidthP1) * 0.5;
  for (let i = 0; i < handSizeP1; i++) {
    const card = state.playerOneHand[i];
    if (
      UICreateCardButton(
        ctx,
        state,
        input,
        card,
        startXP1 + i * (CARD_WIDTH + spaceBetweenCards),
        yP1
      )
    ) {
      //console.log(card);
    }
  }
  const handSizeP2 = state.playerOneHand.length;
  const yP2 = 30;
  const totalWidthP2 =
    handSizeP2 * CARD_WIDTH + spaceBetweenCards * (handSizeP2 - 1);
  const startXP2 = (SCREEN_WIDTH - totalWidthP2) * 0.5;
  for (let i = 0; i < handSizeP2; i++) {
    const card = state.playerTwoHand[i];
    const cx = startXP2 + i * (CARD_WIDTH + spaceBetweenCards);
    const cy = yP2;
    renderCard(ctx, card, cx, cy, "white");
  }
  renderDeck(ctx, state.deck);
}
