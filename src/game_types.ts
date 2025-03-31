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
  x: number;
  y: number;
  hovered: boolean;
  selected: boolean;
  suit: Suit;
  rank: Rank;
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
  selectedCards: Rank[];
  log: string[];

  hoveredCard: Card | null;
  selectedCard: Card | null;
};
