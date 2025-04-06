//import { isPointInRect } from "./game";
import { CARD_HEIGHT, CARD_WIDTH } from "./game_constants";
import { Card, GameState, Input } from "./game_types";
import { renderCard, renderButton } from "./renderer";

export function UIStart(state: GameState) {
  state.idCounter = 0;
  state.hotItem = 0;
}

export function UIEnd(state: GameState, input: Input) {
  if (!input.action.isDown) {
    state.activeItem = 0;
  } else {
    if (state.activeItem === 0) {
      state.activeItem = -1;
    }
  }
}

function UIGetID(state: GameState) {
  state.idCounter++;
  return state.idCounter;
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

export function UICreateCardButton(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  input: Input,
  card: Card,
  x: number,
  y: number
) {
  const id = UIGetID(state);
  if (
    isPointInRect(input.mouseX, input.mouseY, x, y, CARD_WIDTH, CARD_HEIGHT)
  ) {
    state.hotItem = id;
    if (state.activeItem === 0 && input.action.isDown) {
      state.activeItem = id;
      //result = true
    }
  }

  if (state.hotItem === id) {
    renderCard(ctx, card, x, y, "yellow");
  } else {
    renderCard(ctx, card, x, y, "white");
  }

  if (state.hotItem === id && state.activeItem === id && !input.action.isDown) {
    return true;
  }

  return false;
}

export function UICreateTextButton(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  input: Input,
  text: string,
  x: number,
  y: number,
  padding: number
) {
  const id = UIGetID(state);
  if (
    isPointInRect(input.mouseX, input.mouseY, x, y, CARD_WIDTH, CARD_HEIGHT)
  ) {
    state.hotItem = id;
    if (state.activeItem === 0 && input.action.isDown) {
      state.activeItem = id;
    }
  }

  if (state.hotItem === id) {
    renderButton(ctx, text, x, y, padding, "black", "yellow");
  } else {
    renderButton(ctx, text, x, y, padding, "black", "white");
  }

  if (state.hotItem === id && state.activeItem === id && !input.action.isDown) {
    return true;
  }

  return false;
}
