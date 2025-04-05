import { Card, Button, GameState, Attack, Input } from "./game_types";
import {
  Suit,
  Rank,
  Phase,
  CARD_WIDTH,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from "./game_constants";
import { renderCard, renderDeck, renderSelectRect } from "./renderer";
import { UICreateCardButton, UICreateTextButton } from "./ui";

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
  //state.currentAttack = attack;
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

function checkGameOver(state: GameState, hand: Card[]) {
  if (state.deck.length === 0 && hand.length === 0) {
    state.gameOver = true;
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
    state.bout.length < enemyHandLength
  ) {
    state.events.push({ type: "Discard", card, hand });
    createAttack(state, card);
    return true;
  }
  return false;
}

function defend(state: GameState, card: Card, hand: Card[]) {
  if (createDefense(state, card)) {
    state.events.push({ type: "Discard", card, hand });
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
      if (
        attack(state, card, state.playerOneHand, state.playerTwoHand.length)
      ) {
        //state.phase = Phase.PHASE_P2_DEFEND;
      }
      break;
    case Phase.PHASE_P2_DEFEND:
      if (defend(state, card, state.playerTwoHand)) {
        checkGameOver(state, state.playerTwoHand);
        if (!state.gameOver && isDefended(state)) {
          state.phase = Phase.PHASE_P1_ATTACK;
        }
      }
      break;
    case Phase.PHASE_P2_ATTACK:
      if (
        attack(state, card, state.playerTwoHand, state.playerOneHand.length)
      ) {
        //state.phase = Phase.PHASE_P1_DEFEND;
      }
      break;
    case Phase.PHASE_P1_DEFEND:
      if (defend(state, card, state.playerOneHand)) {
        checkGameOver(state, state.playerOneHand);
        if (!state.gameOver && isDefended(state)) {
          state.phase = Phase.PHASE_P2_ATTACK;
        }
      }
      break;
  }
}

function performEvent(state: GameState) {
  for (const event of state.events) {
    switch (event.type) {
      case "Discard":
        //console.log("discarding");
        //event.hand = removeCardFromHand(event.hand, event.card);
        removeCardFromHand(event.hand, event.card);
    }
  }
  state.events = [];
}

function discardBouts(state: GameState) {
  state.bout = [];
}

function acceptBouts(state: GameState, hand: Card[]) {
  for (const bout of state.bout) {
    hand.push(bout.attack);
    if (bout.defense !== null) {
      hand.push(bout.defense);
    }
  }
  state.bout = [];
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
        //console.log(card);
        performCardAction(state, card);
      }
    } else {
      renderCard(
        ctx,
        card,
        startXP1 + i * (CARD_WIDTH + spaceBetweenCards),
        yP1,
        "white"
      );
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
        state.selectedCards.clear();
        state.currentAttack = null;
        //draw cards player 2
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
      state.selectedCards.clear();
      //draw cards player 2
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
        //console.log(card);
        performCardAction(state, card);
      }
    } else {
      renderCard(ctx, card, cx, cy, "white");
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
        state.selectedCards.clear();
        state.currentAttack = null;
        //draw cards player1
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
      state.selectedCards.clear();
      //draw cards player 1
    }
  }

  renderDeck(ctx, state.deck);

  //state.playerOneHand = removeCardFromHand(state.playerOneHand);
  performEvent(state);
}
