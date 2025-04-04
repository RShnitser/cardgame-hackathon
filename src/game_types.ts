import { Suit, Rank, Phase } from "./game_constants";

export type Button = {
  isDown: boolean;
  isChanged: boolean;
};

export type Input = {
  mouseX: number;
  mouseY: number;
  action: Button;
};

export type Card = {
  suit: Suit;
  rank: Rank;
  //remove: boolean;
};

export type Attack = {
  attack: Card;
  defense: Card | null;
};

export type GameState = {
  deck: Card[];
  phase: Phase;
  trump: Suit;
  playerOneHand: Card[];
  playerTwoHand: Card[];
  bout: Attack[];
  currentAttack: Attack | null;
  selectedCards: Set<Rank>;
  events: Event[];
  //log: string[];

  //UI
  idCounter: number;
  hotItem: number;
  activeItem: number;
};

type EventDiscard = {
  type: "Discard";
  card: Card;
  hand: Card[];
};

type EventTakeCards = {
  type: "Take";
  hand: Card[];
};

export type Event = EventDiscard | EventTakeCards;
