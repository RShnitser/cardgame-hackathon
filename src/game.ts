import { Card, GameState, Attack, Input } from "./game_types";
import {
  Suit,
  Rank,
  Phase,
  CARD_WIDTH,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "./game_constants";
import {
  renderCard,
  renderCardBack,
  renderDeck,
  renderSelectRect,
} from "./renderer";
import { UICreateCardButton, UICreateTextButton } from "./ui";
import { displayGameOver } from "./main";

function compareCard(a: Card, b: Card) {
  if (a.suit === b.suit) {
    return a.rank - b.rank;
  }
  return a.suit - b.suit;
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

export function resetGame(state: GameState) {
  state.gameOver = false;
  state.selectedCards.clear();
  state.events = [];
  dealCards(state);
}

function drawCards(hand: Card[], deck: Card[]) {
  if (hand.length >= 6) {
    return;
  }
  const amount = Math.min(6 - hand.length, deck.length);
  for (let i = 0; i < amount; i++) {
    const card = deck.pop();
    if (card !== undefined) {
      hand.push(card);
    }
  }
  hand.sort(compareCard);
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
    drawCards(state.playerOneHand, state.deck);
    drawCards(state.playerTwoHand, state.deck);

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
    return false;
  }

  if (
    card.suit === state.trump &&
    state.currentAttack.attack.suit !== state.trump
  ) {
    state.currentAttack.defense = card;
    state.selectedCards.add(card.rank);
    return true;
  }

  if (
    card.suit === state.currentAttack.attack.suit &&
    card.rank > state.currentAttack.attack.rank
  ) {
    state.currentAttack.defense = card;
    state.selectedCards.add(card.rank);
    return true;
  }
  return false;
}

function createAttack(state: GameState, card: Card) {
  state.selectedCards.add(card.rank);

  const attack: Attack = {
    attack: card,
    defense: null,
  };
  state.bout.push(attack);
}

function isValidRank(state: GameState, rank: Rank) {
  if (state.selectedCards.size === 0) {
    return true;
  }

  return state.selectedCards.has(rank);
}

function removeCardFromHand(hand: Card[], card: Card) {
  const index = hand.indexOf(card);
  hand.splice(index, 1);
}

function checkGameOver(state: GameState, hand: Card[]) {
  if (state.deck.length === 0 && hand.length === 0) {
    state.gameOver = true;
    displayGameOver();
  }
}

function attack(
  state: GameState,
  card: Card,
  hand: Card[],
  enemyHandLength: number
) {
  if (
    isValidRank(state, card.rank) &&
    state.bout.length < 6 &&
    enemyHandLength > 0
  ) {
    state.events.push({ card, hand });
    createAttack(state, card);
    return true;
  }
  return false;
}

function defend(state: GameState, card: Card, hand: Card[]) {
  if (createDefense(state, card)) {
    state.events.push({ card, hand });
    state.currentAttack = null;
    return true;
  }
  return false;
}
function isDefended(state: GameState) {
  for (const bout of state.bout) {
    if (bout.defense === null) {
      return false;
    }
  }
  return true;
}

function performCardAction(state: GameState, card: Card) {
  switch (state.phase) {
    case Phase.PHASE_P1_ATTACK:
      attack(state, card, state.playerOneHand, state.playerTwoHand.length);
      break;
    case Phase.PHASE_P2_DEFEND:
      if (defend(state, card, state.playerTwoHand)) {
        if (!state.gameOver && isDefended(state)) {
          state.phase = Phase.PHASE_P1_ATTACK;
        }
      }
      break;
    case Phase.PHASE_P2_ATTACK:
      attack(state, card, state.playerTwoHand, state.playerOneHand.length);
      break;
    case Phase.PHASE_P1_DEFEND:
      if (defend(state, card, state.playerOneHand)) {
        if (!state.gameOver && isDefended(state)) {
          state.phase = Phase.PHASE_P2_ATTACK;
        }
      }
      break;
  }
}

function performDiscard(state: GameState) {
  for (const event of state.events) {
    removeCardFromHand(event.hand, event.card);
  }
  state.events = [];
}

function discardBouts(state: GameState) {
  state.currentAttack = null;
  state.selectedCards.clear();
  state.bout = [];
  drawCards(state.playerOneHand, state.deck);
  drawCards(state.playerTwoHand, state.deck);
}

function acceptBouts(state: GameState, hand: Card[]) {
  for (const bout of state.bout) {
    hand.push(bout.attack);
    if (bout.defense !== null) {
      hand.push(bout.defense);
    }
  }
  state.selectedCards.clear();
  state.currentAttack = null;
  state.bout = [];
  drawCards(state.playerOneHand, state.deck);
  drawCards(state.playerTwoHand, state.deck);
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
  const yP1 = 400;
  const totalWidthP1 =
    handSizeP1 * CARD_WIDTH + spaceBetweenCards * (handSizeP1 - 1);
  const startXP1 = (SCREEN_WIDTH - totalWidthP1) * 0.5;
  for (let i = 0; i < handSizeP1; i++) {
    const card = state.playerOneHand[i];
    if (
      state.phase === Phase.PHASE_P1_ATTACK ||
      state.phase === Phase.PHASE_P1_DEFEND
    ) {
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
        performCardAction(state, card);
      }
    } else {
      renderCardBack(ctx, startXP1 + i * (CARD_WIDTH + spaceBetweenCards), yP1);
    }
  }

  if (state.phase === Phase.PHASE_P1_ATTACK) {
    if (
      UICreateTextButton(
        ctx,
        state,
        input,
        "Continue",
        SCREEN_WIDTH * 0.5,
        500,
        10
      )
    ) {
      let isDefended = true;
      for (const bout of state.bout) {
        if (bout.defense === null) {
          isDefended = false;
          break;
        }
      }
      if (isDefended) {
        discardBouts(state);
        state.phase = Phase.PHASE_P2_ATTACK;
      } else {
        state.phase = Phase.PHASE_P2_DEFEND;
      }
    }
  }

  if (state.phase === Phase.PHASE_P1_DEFEND) {
    if (
      UICreateTextButton(ctx, state, input, "Pass", SCREEN_WIDTH * 0.5, 500, 10)
    ) {
      acceptBouts(state, state.playerOneHand);
      state.phase = Phase.PHASE_P2_ATTACK;
    }
  }

  const handSizeP2 = state.playerTwoHand.length;
  const yP2 = 130;
  const totalWidthP2 =
    handSizeP2 * CARD_WIDTH + spaceBetweenCards * (handSizeP2 - 1);
  const startXP2 = (SCREEN_WIDTH - totalWidthP2) * 0.5;
  for (let i = 0; i < handSizeP2; i++) {
    const card = state.playerTwoHand[i];
    const cx = startXP2 + i * (CARD_WIDTH + spaceBetweenCards);
    const cy = yP2;
    if (
      state.phase === Phase.PHASE_P2_ATTACK ||
      state.phase === Phase.PHASE_P2_DEFEND
    ) {
      if (UICreateCardButton(ctx, state, input, card, cx, cy)) {
        performCardAction(state, card);
      }
    } else {
      renderCardBack(ctx, cx, cy);
    }
  }

  const boutSize = state.bout.length;
  const boutY = SCREEN_HEIGHT * 0.5 - CARD_WIDTH * 0.5;
  const totalBoutWidth =
    boutSize * CARD_WIDTH + spaceBetweenCards * (boutSize - 1);
  const startBoutX = (SCREEN_WIDTH - totalBoutWidth) * 0.5;
  for (let i = 0; i < state.bout.length; i++) {
    const attackCard = state.bout[i].attack;
    const defenseCard = state.bout[i].defense;

    if (state.bout[i] === state.currentAttack) {
      renderSelectRect(
        ctx,
        startBoutX + i * (CARD_WIDTH + spaceBetweenCards),
        boutY
      );
    }

    if (
      (state.phase === Phase.PHASE_P1_DEFEND ||
        state.phase === Phase.PHASE_P2_DEFEND) &&
      state.bout[i].defense === null
    ) {
      if (
        UICreateCardButton(
          ctx,
          state,
          input,
          attackCard,
          startBoutX + i * (CARD_WIDTH + spaceBetweenCards),
          boutY
        )
      ) {
        state.currentAttack = state.bout[i];
      }
    } else {
      renderCard(
        ctx,
        attackCard,
        startBoutX + i * (CARD_WIDTH + spaceBetweenCards),
        boutY,
        "white"
      );
    }
    if (defenseCard !== null) {
      renderCard(
        ctx,
        defenseCard,
        startBoutX + i * (CARD_WIDTH + spaceBetweenCards),
        boutY + 40,
        "white"
      );
    }
  }

  if (state.phase === Phase.PHASE_P2_ATTACK) {
    if (
      UICreateTextButton(
        ctx,
        state,
        input,
        "Continue",
        SCREEN_WIDTH * 0.5,
        50,
        10
      )
    ) {
      let isDefended = true;
      for (const bout of state.bout) {
        if (bout.defense === null) {
          isDefended = false;
          break;
        }
      }
      if (isDefended) {
        discardBouts(state);
        state.phase = Phase.PHASE_P1_ATTACK;
      } else {
        state.phase = Phase.PHASE_P1_DEFEND;
      }
    }
  }

  if (state.phase === Phase.PHASE_P2_DEFEND) {
    if (
      UICreateTextButton(ctx, state, input, "Pass", SCREEN_WIDTH * 0.5, 50, 10)
    ) {
      acceptBouts(state, state.playerTwoHand);
      state.phase = Phase.PHASE_P1_ATTACK;
    }
  }

  if (state.deck.length > 0) {
    renderDeck(ctx, state.deck);
  }

  performDiscard(state);
  checkGameOver(state, state.playerOneHand);
  checkGameOver(state, state.playerTwoHand);
}
