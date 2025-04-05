import { Card } from "./game_types";
import {
  Suit,
  suitMap,
  rankMap,
  CARD_HEIGHT,
  CARD_WIDTH,
  SCREEN_HEIGHT,
} from "./game_constants";

export function renderClear(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
}

export function renderCard(
  ctx: CanvasRenderingContext2D,
  card: Card,
  x: number,
  y: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, CARD_WIDTH, CARD_HEIGHT);
  if (card.suit === Suit.CLUBS || card.suit === Suit.SPADES) {
    ctx.fillStyle = "black";
  } else {
    ctx.fillStyle = "red";
  }
  const suitString = suitMap.get(card.suit) as string;
  const rankString = rankMap.get(card.rank) as string;
  ctx.fillText(suitString, x + 5, y + 20);
  ctx.fillText(rankString, x + 15, y + 45);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x, y, CARD_WIDTH, CARD_HEIGHT);
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

export function renderButton(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  //width: number,
  //height: number,
  padding: number,
  textColor: string,
  backgroundColor: string
) {
  const fontSize = 28;
  ctx.fillStyle = backgroundColor;
  const measure = ctx.measureText(text);
  ctx.fillRect(x, y, measure.width + padding * 2, fontSize + padding * 2);
  ctx.fillStyle = textColor;
  ctx.fillText(text, x + padding, y + fontSize + padding);
  ctx.strokeStyle = "black";
  ctx.strokeRect(x, y, measure.width + padding * 2, fontSize + padding * 2);
}

export function renderSelectRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
) {
  ctx.fillStyle = "orange";
  ctx.fillRect(x - 2, y - 2, CARD_WIDTH + 4, CARD_HEIGHT + 4);
}
