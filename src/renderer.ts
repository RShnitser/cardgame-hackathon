import { Card } from "./game_types";
import {
  Suit,
  suitMap,
  rankMap,
  CARD_HEIGHT,
  CARD_WIDTH,
  SCREEN_HEIGHT,
} from "./game_constants";

export function renderCard(ctx: CanvasRenderingContext2D, card: Card) {
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

export function renderDeck(ctx: CanvasRenderingContext2D, deck: Card[]) {
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
