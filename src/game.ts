import { Card, Button, GameState, Attack } from "./game_types";
import { Suit, Rank, Phase } from "./game_constants";

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

export function isButtonDown(button: Button) {
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

export function dealCards(state: GameState) {
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

function createAttack(state: GameState, card: Card) {
  state.selectedCards.push(card.rank);

  const attack: Attack = {
    attack: card,
    defense: null,
  };
  state.currentAttack = attack;
}
