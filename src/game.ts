import { Card, Button, GameState, Attack, Input } from "./game_types";
import {
  Suit,
  Rank,
  Phase,
  CARD_WIDTH,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
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

    // for (const card of state.playerOneHand) {
    //   if (card.suit === state.trump) {
    //     if (lowestTrumpOne === null || card.rank < lowestTrumpOne) {
    //       lowestTrumpOne = card.rank;
    //     }
    //   }
    // }

    // for (const card of state.playerTwoHand) {
    //   if (card.suit === state.trump) {
    //     if (lowestTrumpTwo === null || card.rank < lowestTrumpTwo) {
    //       lowestTrumpTwo = card.rank;
    //     }
    //   }
    // }

    // if (lowestTrumpOne === null && lowestTrumpTwo !== null) {
    //   state.phase = Phase.PHASE_P2_ATTACK;
    // }

    // if (lowestTrumpOne !== null && lowestTrumpTwo !== null) {
    //   if (lowestTrumpTwo < lowestTrumpOne) {
    //     state.phase = Phase.PHASE_P2_ATTACK;
    //   }
    // }

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
  state.selectedCards.add(card.rank);

  const attack: Attack = {
    attack: card,
    defense: null,
  };
  state.bout.push(attack);
  state.currentAttack = attack;
}

function isValidRank(state: GameState, rank: Rank) {
  if (state.selectedCards.size === 0) {
    return true;
  }

  return state.selectedCards.has(rank);
}

function removeCardFromHand(hand: Card[], card: Card) {
  // const result = hand.filter(function (currentCard) {
  //   return !(currentCard.suit === card.suit && currentCard.rank === card.rank);
  // });
  // return result;
  const index = hand.indexOf(card);
  hand.splice(index, 1);
}

function performCardAction(state: GameState, card: Card) {
  switch (state.phase) {
    case Phase.PHASE_P1_ATTACK:
      if (isValidRank(state, card.rank) && state.bout.length < 6) {
        //state.playerOneHand = removeCardFromHand(state.playerOneHand, card);
        //card.remove = true;
        state.events.push({ type: "Discard", card, hand: state.playerOneHand });
        createAttack(state, card);
        //state.phase = Phase.PHASE_P2_DEFEND;
      }
      break;
  }
}

function performEvent(state: GameState) {
  for (const event of state.events) {
    switch (event.type) {
      case "Discard":
        console.log("discarding");
        //event.hand = removeCardFromHand(event.hand, event.card);
        removeCardFromHand(event.hand, event.card);
    }
  }
  state.events = [];
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
      performCardAction(state, card);
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

  const boutSize = state.bout.length;
  const boutY = SCREEN_HEIGHT * 0.5 - CARD_WIDTH * 0.5;
  const totalBoutWidth =
    boutSize * CARD_WIDTH + spaceBetweenCards * (boutSize - 1);
  const startBoutX = (SCREEN_WIDTH - totalBoutWidth) * 0.5;
  for (let i = 0; i < state.bout.length; i++) {
    const attackCard = state.bout[i].attack;
    const defenseCard = state.bout[i].defense;
    renderCard(
      ctx,
      attackCard,
      startBoutX + i * (CARD_WIDTH + spaceBetweenCards),
      boutY,
      "white"
    );
    if (defenseCard !== null) {
    }
  }

  renderDeck(ctx, state.deck);

  //state.playerOneHand = removeCardFromHand(state.playerOneHand);
  performEvent(state);
}
